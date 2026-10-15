import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { publicPlatformScript } from "../server/_core/publicConfig";
import { registerPaymentCheckout, registerPaymentWebhook } from "../server/paymentRoutes";

const app = express();
// Stripe must receive the exact raw bytes for signature verification.
registerPaymentWebhook(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "lefind" }));
app.get("/api/platform/config.js", (_req, res) => res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript()));
registerPaymentCheckout(app);
registerOAuthRoutes(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
export default app;
