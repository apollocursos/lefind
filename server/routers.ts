import { z } from "zod";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "./db";
import { entitlements, profiles, quotes } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { applyManualOverride, fulfillStripeEvent, PRODUCTS } from "./payments";

const demoDirectory = [
  { slug: "carlos-piscineiro", name: "Carlos Mendes", role: "Piscineiro & manutenção", city: "Porto Feliz, SP", rating: 4.9, verified: true, sos: true },
  { slug: "bia-eletrica", name: "Bia Elétrica", role: "Eletricista residencial", city: "Porto Feliz, SP", rating: 5, verified: true, sos: true },
  { slug: "joao-chaveiro", name: "João Chaveiro", role: "Chaveiro 24 horas", city: "Porto Feliz, SP", rating: 4.8, verified: true, sos: true },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  directory: router({
    stats: publicProcedure.query(() => ({ professionals: 24800, cities: 37, reviews: 12840 })),
    search: publicProcedure.input(z.object({ query: z.string().optional(), sos: z.boolean().optional(), verified: z.boolean().optional() }).optional()).query(({ input }) => demoDirectory.filter(item => (!input?.query || `${item.name} ${item.role} ${item.city}`.toLowerCase().includes(input.query.toLowerCase())) && (!input?.sos || item.sos) && (!input?.verified || item.verified))),
    setSos: publicProcedure.input(z.object({ slug: z.string(), enabled: z.boolean() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (db) await db.update(profiles).set({ sos: input.enabled ? 1 : 0 }).where(eq(profiles.slug, input.slug));
      return { slug: input.slug, enabled: input.enabled };
    }),
  }),
  quotes: router({
    create: publicProcedure.input(z.object({ profileId: z.number().optional(), requesterName: z.string().min(2), description: z.string().min(3) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (db) await db.insert(quotes).values({ ...input, requesterPhone: undefined });
      return { ...input, status: "new" as const, createdAt: new Date().toISOString() };
    }),
  }),
  payments: router({
    products: publicProcedure.query(() => PRODUCTS),
    processTestEvent: adminProcedure.input(z.object({ eventId: z.string().min(3), type: z.string().min(3), product: z.enum(["gold", "sponsored_spot"]), profileSlug: z.string().optional(), storeId: z.number().optional() })).mutation(async ({ input }) => fulfillStripeEvent({ id: input.eventId, type: input.type, data: { object: { id: input.eventId, payment_status: "paid", amount_total: PRODUCTS[input.product].amountCents, currency: "brl", payment_method_types: ["card"], metadata: { product: input.product, profileSlug: input.profileSlug, storeId: input.storeId ? String(input.storeId) : undefined } } } })),
    status: publicProcedure.input(z.object({ targetKey: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { targetKey: input.targetKey, status: "demo" as const, source: "payment" as const };
      const result = await db.select().from(entitlements).where(eq(entitlements.targetKey, input.targetKey)).limit(1);
      return result[0] ?? { targetKey: input.targetKey, status: "revoked" as const, source: "payment" as const };
    }),
  }),
  admin: router({
    entitlements: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [{ targetKey: "profile:carlos-piscineiro", kind: "gold", status: "active", source: "payment", manualOverride: "none" }];
      return db.select().from(entitlements);
    }),
    override: adminProcedure.input(z.object({ kind: z.enum(["gold", "sponsored_spot"]), profileSlug: z.string().optional(), storeId: z.number().optional(), action: z.enum(["grant", "revoke"]), reason: z.string().max(255).optional() })).mutation(async ({ input, ctx }) => applyManualOverride({ ...input, adminUserId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
