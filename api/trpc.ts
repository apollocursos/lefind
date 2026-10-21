import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

function serializeCookie(name: string, value: string, options: Record<string, unknown>) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  parts.push(`Path=${typeof options.path === "string" ? options.path : "/"}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  parts.push(`SameSite=${options.sameSite === "none" ? "None" : options.sameSite === "strict" ? "Strict" : "Lax"}`);
  if (typeof options.maxAge === "number") parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  return parts.join("; ");
}

function responseForContext(res: any) {
  return {
    ...res,
    cookie(name: string, value: string, options: Record<string, unknown> = {}) {
      const header = serializeCookie(name, value, options);
      const current = res.getHeader("Set-Cookie");
      res.setHeader("Set-Cookie", [...(Array.isArray(current) ? current : current ? [String(current)] : []), header]);
    },
    clearCookie(name: string, options: Record<string, unknown> = {}) {
      this.cookie(name, "", { ...options, maxAge: 0 });
    },
  };
}

export default async function handler(req: any, res: any) {
  const rawPath = String(req.url ?? "").split("?")[0];
  const path = rawPath.replace(/^\/api\/trpc\/?/, "");
  return nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: ({ req: nodeReq, res: nodeRes }) => createContext({ req: nodeReq as any, res: responseForContext(nodeRes) as any, info: {} as any }),
  });
}
