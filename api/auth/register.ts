import { findLocalUserByEmail, insertLocalUser } from "../../server/_core/authStore";
import { hashPassword, newLocalOpenId } from "../../server/_core/localAuth";
import { createLocalSession, publicUser, setLocalSession } from "../../server/_core/localSession";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    const { name, email, password } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length < 2 || typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "invalid_input", message: "Informe nome, e-mail válido e senha com pelo menos 8 caracteres." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await findLocalUserByEmail(normalizedEmail)) return res.status(409).json({ error: "email_in_use", message: "Este e-mail já possui uma conta. Entre com sua senha." });
    const user = await insertLocalUser({ openId: newLocalOpenId(), name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) });
    if (!user) return res.status(500).json({ error: "user_creation_failed", message: "Não foi possível criar a conta." });
    setLocalSession(res, await createLocalSession(user));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error("[Auth] register failed", error);
    return res.status(503).json({ error: "auth_unavailable", message: "O acesso está temporariamente indisponível. Tente novamente em instantes." });
  }
}
