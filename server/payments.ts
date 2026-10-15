import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { ambassadors, entitlements, paymentEvents, payments, profiles, sponsoredSpots } from "../drizzle/schema";

export const PRODUCTS = {
  gold: { name: "Profissional Ouro", amountCents: 3990, durationDays: 30 },
  sponsored_spot: { name: "Anúncio Ativo", amountCents: 2990, durationDays: 30 },
} as const;

export type ProductType = keyof typeof PRODUCTS;
export type ManualAction = "grant" | "revoke";

function isProductType(value: unknown): value is ProductType {
  return value === "gold" || value === "sponsored_spot";
}

export function verifyStripeSignature(rawBody: Buffer, signature: string | undefined, secret: string | undefined) {
  if (!signature || !secret) return false;
  const parts = Object.fromEntries(signature.split(",").map(item => item.split("=", 2) as [string, string]));
  const timestamp = parts.t;
  const received = parts.v1;
  const timestampNumber = Number(timestamp);
  if (!timestamp || !received || !Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
  try { return timingSafeEqual(Buffer.from(expected), Buffer.from(received)); } catch { return false; }
}

function eventOutcome(type: string, object: Record<string, any>) {
  if (type === "payment_intent.succeeded") return "approved" as const;
  if (type === "checkout.session.completed") return object.payment_status === "paid" ? "approved" as const : "pending" as const;
  if (type === "customer.subscription.created" || type === "customer.subscription.updated") return object.status === "active" ? "approved" as const : "pending" as const;
  if (type === "payment_intent.payment_failed") return "failed" as const;
  if (type === "customer.subscription.deleted" || type === "charge.refunded") return "refunded" as const;
  return "ignored" as const;
}

function paymentMethod(object: Record<string, any>) {
  const value = object.payment_method_types?.[0] ?? object.payment_method_details?.type ?? "card";
  return value === "pix" ? "pix" as const : "card" as const;
}

async function setTargetState(kind: ProductType, profileId: number | null, storeId: number | null, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  if (kind === "gold" && profileId) await db.update(profiles).set({ gold: enabled ? 1 : 0 }).where(eq(profiles.id, profileId));
  if (kind === "sponsored_spot" && storeId) {
    await db.update(sponsoredSpots).set({ status: enabled ? "active" : "paused" }).where(eq(sponsoredSpots.storeId, storeId));
  }
}

async function upsertEntitlement(input: { targetKey: string; kind: ProductType; profileId: number | null; storeId: number | null; paymentId: number | null; status: "active" | "revoked"; source: "payment" | "manual"; manualOverride: "none" | "grant" | "revoke"; overrideByUserId?: number | null; overrideReason?: string | null; durationDays?: number }) {
  const db = await getDb();
  if (!db) return { ...input, demo: true };
  const current = await db.select().from(entitlements).where(eq(entitlements.targetKey, input.targetKey)).limit(1);
  const now = new Date();
  const endsAt = input.durationDays ? new Date(now.getTime() + input.durationDays * 86400000) : null;
  const values = { targetKey: input.targetKey, kind: input.kind, profileId: input.profileId, storeId: input.storeId, paymentId: input.paymentId, status: input.status, source: input.source, manualOverride: input.manualOverride, overrideByUserId: input.overrideByUserId ?? null, overrideReason: input.overrideReason ?? null, startsAt: input.status === "active" ? now : null, endsAt };
  if (current[0]) await db.update(entitlements).set({ ...values, updatedAt: now }).where(eq(entitlements.targetKey, input.targetKey));
  else await db.insert(entitlements).values(values);
  await setTargetState(input.kind, input.profileId, input.storeId, input.status === "active");
  return { ...values, demo: false };
}

export async function applyManualOverride(input: { kind: ProductType; profileSlug?: string; storeId?: number; action: ManualAction; adminUserId: number; reason?: string }) {
  const db = await getDb();
  if (!db) return { ok: true, demo: true, ...input };
  let profileId: number | null = null;
  if (input.profileSlug) {
    const profile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.slug, input.profileSlug)).limit(1);
    profileId = profile[0]?.id ?? null;
  }
  const storeId = input.storeId ?? null;
  const targetKey = input.kind === "gold" ? `profile:${input.profileSlug}` : `store:${storeId}`;
  if (!profileId && input.kind === "gold") throw new Error("Profile not found for manual override");
  const status = input.action === "grant" ? "active" : "revoked";
  return { ok: true, ...(await upsertEntitlement({ targetKey, kind: input.kind, profileId, storeId, paymentId: null, status, source: "manual", manualOverride: input.action, overrideByUserId: input.adminUserId, overrideReason: input.reason ?? "ADM override" })) };
}

export async function fulfillStripeEvent(event: Record<string, any>) {
  const db = await getDb();
  const object = (event.data?.object ?? {}) as Record<string, any>;
  const metadata = (object.metadata ?? {}) as Record<string, string>;
  const outcome = eventOutcome(String(event.type), object);
  if (outcome === "ignored") return { ok: true, ignored: true, eventId: event.id };
  if (!isProductType(metadata.product)) return { ok: true, ignored: true, reason: "missing_product_metadata", eventId: event.id };
  if (!db) return { ok: true, demo: true, eventId: event.id, product: metadata.product, status: outcome };
  const alreadyProcessed = await db.select({ id: paymentEvents.id }).from(paymentEvents).where(eq(paymentEvents.eventId, String(event.id))).limit(1);
  if (alreadyProcessed.length) return { ok: true, duplicate: true, eventId: event.id };

  let profileId: number | null = null;
  if (metadata.profileSlug) {
    const profile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.slug, metadata.profileSlug)).limit(1);
    profileId = profile[0]?.id ?? null;
  }
  const storeId = metadata.storeId ? Number(metadata.storeId) : null;
  const providerPaymentId = String(object.payment_intent ?? object.id ?? "");
  const existingPayment = providerPaymentId ? await db.select({ id: payments.id }).from(payments).where(eq(payments.providerPaymentId, providerPaymentId)).limit(1) : [];
  const product = PRODUCTS[metadata.product];
  const paymentValues = { provider: "stripe", providerPaymentId: providerPaymentId || null, providerEventId: String(event.id), userId: null, profileId, storeId, productType: metadata.product, amountCents: Number(object.amount_total ?? object.amount ?? product.amountCents), currency: String(object.currency ?? "brl"), method: paymentMethod(object), status: outcome === "approved" ? "approved" as const : outcome === "failed" ? "failed" as const : outcome === "refunded" ? "refunded" as const : "pending" as const, metadataJson: JSON.stringify(metadata), paidAt: outcome === "approved" ? new Date() : null };
  let paymentId: number | null = existingPayment[0]?.id ?? null;
  if (paymentId) await db.update(payments).set(paymentValues).where(eq(payments.id, paymentId));
  else { const inserted = await db.insert(payments).values(paymentValues); paymentId = Number((inserted as any).insertId) || null; }

  const targetKey = metadata.product === "gold" ? `profile:${metadata.profileSlug}` : `store:${storeId ?? metadata.storeName ?? "unknown"}`;
  const current = await db.select().from(entitlements).where(eq(entitlements.targetKey, targetKey)).limit(1);
  if (outcome === "approved") {
    if (current[0]?.manualOverride !== "revoke") await upsertEntitlement({ targetKey, kind: metadata.product, profileId, storeId, paymentId, status: "active", source: current[0]?.manualOverride === "grant" ? "manual" : "payment", manualOverride: current[0]?.manualOverride ?? "none", durationDays: Number(metadata.durationDays ?? product.durationDays) });
    if (metadata.referralCode && event.type === "checkout.session.completed") {
      const code = metadata.referralCode.trim().toUpperCase();
      const ambassador = await db.select().from(ambassadors).where(eq(ambassadors.code, code)).limit(1);
      if (ambassador[0]) await db.update(ambassadors).set({ referralCount: sql`${ambassadors.referralCount} + 1` }).where(eq(ambassadors.code, code));
      else await db.insert(ambassadors).values({ code, name: `Embaixador ${code}`, referralCount: 1 });
    }
  } else if (outcome === "failed" || outcome === "refunded") {
    if (current[0]?.manualOverride !== "grant") await upsertEntitlement({ targetKey, kind: metadata.product, profileId, storeId, paymentId, status: "revoked", source: "payment", manualOverride: current[0]?.manualOverride ?? "none" });
  }
  await db.insert(paymentEvents).values({ provider: "stripe", eventId: String(event.id), eventType: String(event.type) });
  return { ok: true, eventId: event.id, status: outcome, paymentId };
}

export async function processStripeWebhook(rawBody: Buffer, signature?: string) {
  if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) return { statusCode: 400, body: { ok: false, error: "invalid_signature" } };
  try {
    const event = JSON.parse(rawBody.toString("utf8"));
    return { statusCode: 200, body: await fulfillStripeEvent(event) };
  } catch (error) {
    console.error("[Payments] webhook processing failed", error);
    return { statusCode: 500, body: { ok: false, error: "processing_failed" } };
  }
}
