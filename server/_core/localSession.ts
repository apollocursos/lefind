import { jwtVerify, SignJWT } from "jose";
import { parse } from "cookie";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";

function secret() {
  if (!ENV.cookieSecret) throw new Error("JWT_SECRET não configurado");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createLocalSession(user: Pick<User, "openId" | "name">) {
  return new SignJWT({ openId: user.openId, appId: ENV.appId, name: user.name ?? "" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secret());
}

export async function userFromLocalRequest(req: Request) {
  const token = parse(req.headers.cookie ?? "")[COOKIE_NAME];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.appId !== ENV.appId || typeof payload.openId !== "string") return null;
    return (await db.getUserByOpenId(payload.openId)) ?? null;
  } catch {
    return null;
  }
}

export function setLocalSession(res: Response, token: string) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(ONE_YEAR_MS / 1000)}; HttpOnly; Secure; SameSite=None`);
}

export function clearLocalSession(res: Response) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None`);
}

export function publicUser(user: User | null | undefined) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
