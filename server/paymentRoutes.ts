import express, { type Express, type Request, type Response } from "express";
import { PRODUCTS, processStripeWebhook, type ProductType } from "./payments";

function publicOrigin(req: Request) {
  const origin = req.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) return origin.replace(/\/$/, "");
  const configured = process.env.PUBLIC_APP_URL;
  if (configured && /^https?:\/\//i.test(configured)) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function registerPaymentWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body ?? ""));
    const result = await processStripeWebhook(rawBody, req.get("stripe-signature"));
    res.status(result.statusCode).json(result.body);
  });
}

export function registerPaymentCheckout(app: Express) {
  app.post("/api/payments/checkout", async (req: Request, res: Response) => {
    const { product, profileSlug, storeId, storeName, buyerEmail, buyerName } = req.body ?? {};
    if (product !== "gold" && product !== "sponsored_spot") return res.status(400).json({ error: "invalid_product" });
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return res.status(503).json({ error: "payment_not_configured", message: "Stripe ainda não foi configurado neste ambiente." });
    const selected = PRODUCTS[product as ProductType];
    const metadata: Record<string, string> = { product, durationDays: String(selected.durationDays) };
    if (profileSlug) metadata.profileSlug = String(profileSlug);
    if (storeId) metadata.storeId = String(storeId);
    if (storeName) metadata.storeName = String(storeName);
    const params = new URLSearchParams();
    params.set("mode", "payment");
    // Stripe now manages eligible methods (including Pix/card) from Dashboard settings.
    // Do not send the removed payment_method_types parameter.
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "brl");
    params.set("line_items[0][price_data][unit_amount]", String(selected.amountCents));
    params.set("line_items[0][price_data][product_data][name]", selected.name);
    params.set("line_items[0][price_data][product_data][description]", product === "gold" ? "Selo Profissional Ouro por 30 dias" : "Spot patrocinado local por 30 dias");
    params.set("allow_promotion_codes", "true");
    params.set("success_url", `${publicOrigin(req)}/${product === "gold" ? "painel" : "lojas"}?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${publicOrigin(req)}/${product === "gold" ? "painel" : "lojas"}?payment=cancelled`);
    if (buyerEmail) params.set("customer_email", String(buyerEmail));
    if (buyerName) params.set("metadata[buyerName]", String(buyerName));
    Object.entries(metadata).forEach(([key, value]) => {
      params.set(`metadata[${key}]`, value);
      params.set(`payment_intent_data[metadata][${key}]`, value);
    });
    try {
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
      const payload = await response.json() as { id?: string; url?: string; error?: { message?: string } };
      if (!response.ok || !payload.url) return res.status(502).json({ error: "stripe_checkout_failed", message: payload.error?.message ?? "Stripe não retornou uma sessão de checkout." });
      return res.json({ url: payload.url, sessionId: payload.id, product, amountCents: selected.amountCents, currency: "brl" });
    } catch (error) {
      console.error("[Payments] checkout creation failed", error);
      return res.status(502).json({ error: "stripe_unreachable" });
    }
  });
}
