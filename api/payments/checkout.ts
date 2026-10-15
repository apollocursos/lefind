export default async function handler(req: any, res: any) {
  try {
    const { handlePaymentCheckout } = await import("../../server/paymentRoutes");
    return handlePaymentCheckout(req, res);
  } catch (error) {
    console.error("[Payments] checkout module failed", error);
    return res.status(500).json({ ok: false, error: "payment_module_failed" });
  }
}
