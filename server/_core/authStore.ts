import { createRequire } from "node:module";
import { ENV } from "./env";

type LocalUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  passwordHash: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

let pool: any;
function getPool() {
  if (!pool) {
    if (!ENV.databaseUrl) throw new Error("DATABASE_URL não configurado");
    const require = createRequire(import.meta.url);
    const mysql = require("mysql2/promise");
    pool = mysql.createPool(ENV.databaseUrl);
  }
  return pool;
}

export async function findLocalUserByEmail(email: string): Promise<LocalUser | undefined> {
  const [rows] = await getPool().execute("SELECT id, openId, name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] as LocalUser | undefined;
}

export async function findLocalUserByOpenId(openId: string): Promise<LocalUser | undefined> {
  const [rows] = await getPool().execute("SELECT id, openId, name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE openId = ? LIMIT 1", [openId]);
  return rows[0] as LocalUser | undefined;
}

export async function insertLocalUser(input: { openId: string; name: string; email: string; passwordHash: string }) {
  await getPool().execute("INSERT INTO users (openId, name, email, passwordHash, loginMethod, lastSignedIn) VALUES (?, ?, ?, ?, 'local', CURRENT_TIMESTAMP)", [input.openId, input.name, input.email, input.passwordHash]);
  return findLocalUserByOpenId(input.openId);
}

export async function touchLocalUser(id: number) {
  await getPool().execute("UPDATE users SET lastSignedIn = CURRENT_TIMESTAMP WHERE id = ?", [id]);
}
