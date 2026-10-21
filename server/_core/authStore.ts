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

let poolPromise: Promise<any> | undefined;
async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      if (!ENV.databaseUrl) throw new Error("DATABASE_URL não configurado");
      const mysql = await import("mysql2/promise");
      return mysql.createPool(ENV.databaseUrl);
    })();
  }
  return poolPromise;
}

async function findBy(field: "email" | "openId", value: string): Promise<LocalUser | undefined> {
  const [rows] = await (await getPool()).execute(`SELECT id, openId, name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE ${field} = ? LIMIT 1`, [value]);
  return rows[0] as LocalUser | undefined;
}

export function findLocalUserByEmail(email: string) { return findBy("email", email); }
export function findLocalUserByOpenId(openId: string) { return findBy("openId", openId); }

export async function insertLocalUser(input: { openId: string; name: string; email: string; passwordHash: string }) {
  await (await getPool()).execute("INSERT INTO users (openId, name, email, passwordHash, loginMethod, lastSignedIn) VALUES (?, ?, ?, ?, 'local', CURRENT_TIMESTAMP)", [input.openId, input.name, input.email, input.passwordHash]);
  return findLocalUserByOpenId(input.openId);
}

export async function touchLocalUser(id: number) {
  await (await getPool()).execute("UPDATE users SET lastSignedIn = CURRENT_TIMESTAMP WHERE id = ?", [id]);
}
