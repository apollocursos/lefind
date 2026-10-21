import { findLocalUserByEmail, touchLocalUser } from "../../server/_core/authStore";
import { verifyPassword } from "../../server/_core/localAuth";
import { createLocalSession, publicUser, setLocalSession } from "../../server/_core/localSession";

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") return res.status(400).json({ error: "invalid_input", message: "Informe e-mail e senha." });
    const user = await findLocalUserByEmail(email.trim().toLowerCase());
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: "invalid_credentials", message: "E-mail ou senha inválidos." });
    await touchLocalUser(user.id);
    setLocalSession(res, await createLocalSession(user));
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error("[Auth] login failed", error);
    return res.status(503).json({ error: "auth_unavailable", message: "O acesso está temporariamente indisponível. Tente novamente em instantes." });
  }
}
