import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { publicPlatformScript } from "../server/_core/publicConfig";

const app = express();
// Stripe must receive the exact raw bytes for signature verification.
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try { const { handleStripeWebhook } = await import("../server/paymentRoutes"); return handleStripeWebhook(req, res); }
  catch (error) { console.error("[Payments] webhook module failed", error); return res.status(500).json({ ok: false, error: "payment_module_failed" }); }
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "lefind" }));
app.get("/api/platform/config.js", (_req, res) => res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript()));
app.post("/api/payments/checkout", async (req, res) => {
  try { const { handlePaymentCheckout } = await import("../server/paymentRoutes"); return handlePaymentCheckout(req, res); }
  catch (error) { console.error("[Payments] checkout module failed", error); return res.status(500).json({ ok: false, error: "payment_module_failed" }); }
});
registerOAuthRoutes(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
export default app;
