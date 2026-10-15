export const config = { api: { bodyParser: false } };

async function readRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  try {
    const { processStripeWebhook } = await import("../../server/payments");
    const rawBody = await readRawBody(req);
    const header = req.headers?.["stripe-signature"];
    const signature = Array.isArray(header) ? header[0] : header;
    const result = await processStripeWebhook(rawBody, signature);
    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("[Payments] webhook module failed", error);
    return res.status(500).json({ ok: false, error: "webhook_module_failed" });
  }
}
