import { z } from "zod";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "./db";
import { profiles, quotes } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const demoDirectory = [
  { slug: "carlos-piscineiro", name: "Carlos Mendes", role: "Piscineiro & manutenção", city: "Porto Feliz, SP", rating: 4.9, verified: true, sos: true },
  { slug: "bia-eletrica", name: "Bia Elétrica", role: "Eletricista residencial", city: "Porto Feliz, SP", rating: 5, verified: true, sos: true },
  { slug: "joao-chaveiro", name: "João Chaveiro", role: "Chaveiro 24 horas", city: "Porto Feliz, SP", rating: 4.8, verified: true, sos: true },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  directory: router({
    stats: publicProcedure.query(() => ({ professionals: 24800, cities: 37, reviews: 12840 })),
    search: publicProcedure.input(z.object({ query: z.string().optional(), sos: z.boolean().optional(), verified: z.boolean().optional() }).optional()).query(({ input }) => demoDirectory.filter(item => (!input?.query || `${item.name} ${item.role} ${item.city}`.toLowerCase().includes(input.query.toLowerCase())) && (!input?.sos || item.sos) && (!input?.verified || item.verified))),
    setSos: publicProcedure.input(z.object({ slug: z.string(), enabled: z.boolean() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (db) await db.update(profiles).set({ sos: input.enabled ? 1 : 0 }).where(eq(profiles.slug, input.slug));
      return { slug: input.slug, enabled: input.enabled };
    }),
  }),
  quotes: router({
    create: publicProcedure.input(z.object({ profileId: z.number().optional(), requesterName: z.string().min(2), description: z.string().min(3) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (db) await db.insert(quotes).values({ ...input, requesterPhone: undefined });
      return { ...input, status: "new" as const, createdAt: new Date().toISOString() };
    }),
  }),
});

export type AppRouter = typeof appRouter;
