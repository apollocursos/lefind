const PRODUCTS = {
  gold: { name: "Profissional Ouro", amountCents: 3990, durationDays: 30 },
  sponsored_spot: { name: "Anúncio Ativo", amountCents: 2990, durationDays: 30 },
} as const;

type Product = keyof typeof PRODUCTS;

function origin(req: any) {
  const header = req.headers?.origin;
  if (header && /^https?:\/\//i.test(header)) return String(header).replace(/\/$/, "");
  const configured = process.env.PUBLIC_APP_URL;
  if (configured && /^https?:\/\//i.test(configured)) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

export default async function handler(req: any, res: any) {
  try {
    const { product, profileSlug, storeId, storeName, buyerEmail, buyerName } = req.body ?? {};
    if (product !== "gold" && product !== "sponsored_spot") return res.status(400).json({ error: "invalid_product" });
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return res.status(503).json({ error: "payment_not_configured", message: "Configure STRIPE_SECRET_KEY no ambiente Vercel." });
    const selected = PRODUCTS[product as Product];
    const metadata: Record<string, string> = { product, durationDays: String(selected.durationDays) };
    if (profileSlug) metadata.profileSlug = String(profileSlug);
    if (storeId) metadata.storeId = String(storeId);
    if (storeName) metadata.storeName = String(storeName);
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "brl");
    params.set("line_items[0][price_data][unit_amount]", String(selected.amountCents));
    params.set("line_items[0][price_data][product_data][name]", selected.name);
    params.set("line_items[0][price_data][product_data][description]", product === "gold" ? "Selo Profissional Ouro por 30 dias" : "Spot patrocinado local por 30 dias");
    params.set("allow_promotion_codes", "true");
    params.set("success_url", `${origin(req)}/${product === "gold" ? "painel" : "lojas"}?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${origin(req)}/${product === "gold" ? "painel" : "lojas"}?payment=cancelled`);
    if (buyerEmail) params.set("customer_email", String(buyerEmail));
    if (buyerName) params.set("metadata[buyerName]", String(buyerName));
    for (const [key, value] of Object.entries(metadata)) {
      params.set(`metadata[${key}]`, value);
      params.set(`payment_intent_data[metadata][${key}]`, value);
    }
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params });
    const payload = await response.json() as { id?: string; url?: string; error?: { message?: string } };
    if (!response.ok || !payload.url) return res.status(502).json({ error: "stripe_checkout_failed", message: payload.error?.message ?? "Stripe não retornou uma sessão." });
    return res.json({ url: payload.url, sessionId: payload.id, product, amountCents: selected.amountCents, currency: "brl" });
  } catch (error) {
    console.error("[Payments] checkout failed", error);
    return res.status(502).json({ error: "stripe_unreachable" });
  }
}
