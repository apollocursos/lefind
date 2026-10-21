import { clearLocalSession } from "../../server/_core/localSession";

export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  clearLocalSession(res);
  return res.status(200).json({ ok: true });
}
