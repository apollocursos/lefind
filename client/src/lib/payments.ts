export type CheckoutProduct = "gold" | "sponsored_spot";

export async function startCheckout(input: { product: CheckoutProduct; profileSlug?: string; storeId?: number; storeName?: string; buyerEmail?: string; buyerName?: string; referralCode?: string }) {
  const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) throw new Error(payload.message ?? payload.error ?? "Não foi possível iniciar o pagamento.");
  window.location.assign(payload.url);
}
