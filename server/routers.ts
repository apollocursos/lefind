import { z } from "zod";
import { eq, like, sql } from "drizzle-orm";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { createLocalUser, getDb, getUserByEmail, updateLocalUserSignIn } from "./db";
import { ambassadors, entitlements, profiles, quotes, serviceCategories } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { applyManualOverride, fulfillStripeEvent, PRODUCTS } from "./payments";
import { hashPassword, newLocalOpenId, verifyPassword } from "./_core/localAuth";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

const demoDirectory = [
  { slug: "carlos-piscineiro", name: "Carlos Mendes", role: "Piscineiro & manutenção", city: "Porto Feliz, SP", rating: 4.9, verified: true, sos: true },
  { slug: "bia-eletrica", name: "Bia Elétrica", role: "Eletricista residencial", city: "Porto Feliz, SP", rating: 5, verified: true, sos: true },
  { slug: "joao-chaveiro", name: "João Chaveiro", role: "Chaveiro 24 horas", city: "Porto Feliz, SP", rating: 4.8, verified: true, sos: true },
];

const defaultProfessions = ["Eletricista", "Piscineiro", "Chaveiro 24 horas", "Pintura", "Pet sitter", "Montador de móveis", "Encanador"];
const normalizeProfession = (value: string) => value.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
const slugify = (value: string) => normalizeProfession(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const failedLogins = new Map<string, { count: number; blockedUntil: number }>();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
    registerLocal: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), password: z.string().min(8).max(128) })).mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();
      if (await getUserByEmail(email)) throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já possui uma conta. Entre com sua senha." });
      const user = await createLocalUser({ openId: newLocalOpenId(), name: input.name, email, passwordHash: await hashPassword(input.password) });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível criar a conta." });
      const token = await sdk.signSession({ openId: user.openId, appId: ENV.appId, name: user.name ?? input.name });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return user;
    }),
    loginLocal: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase();
      const attempt = failedLogins.get(email);
      if (attempt?.blockedUntil && attempt.blockedUntil > Date.now()) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." });
      const user = await getUserByEmail(email);
      const valid = Boolean(user?.passwordHash && await verifyPassword(input.password, user.passwordHash));
      if (!user || !valid) {
        const next = { count: (attempt?.count ?? 0) + 1, blockedUntil: 0 };
        if (next.count >= 5) { next.count = 0; next.blockedUntil = Date.now() + 10 * 60 * 1000; }
        failedLogins.set(email, next);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos." });
      }
      failedLogins.delete(email);
      await updateLocalUserSignIn(user.id);
      const token = await sdk.signSession({ openId: user.openId, appId: ENV.appId, name: user.name ?? email });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return user;
    }),
  }),
  directory: router({
    stats: publicProcedure.query(() => ({ professionals: 24800, cities: 37, reviews: 12840 })),
    search: publicProcedure.input(z.object({ query: z.string().optional(), city: z.string().optional(), sos: z.boolean().optional(), verified: z.boolean().optional() }).optional()).query(async ({ input }) => {
      const query = input?.query?.trim().toLocaleLowerCase("pt-BR") ?? "";
      const city = input?.city?.trim().toLocaleLowerCase("pt-BR") ?? "";
      const local = demoDirectory.filter(item => (!query || `${item.name} ${item.role} ${item.city}`.toLocaleLowerCase("pt-BR").includes(query)) && (!city || item.city.toLocaleLowerCase("pt-BR").includes(city)) && (!input?.sos || item.sos) && (!input?.verified || item.verified));
      const db = await getDb();
      if (!db) return local;
      const conditions = [
        query ? sql`lower(concat_ws(' ', ${profiles.name}, ${profiles.role}, ${profiles.city}, ${profiles.neighborhood}, ${profiles.bio})) like ${`%${query}%`}` : undefined,
        city ? sql`lower(${profiles.city}) like ${`%${city}%`}` : undefined,
        input?.sos ? eq(profiles.sos, 1) : undefined,
        input?.verified ? eq(profiles.verified, 1) : undefined,
      ].filter(Boolean) as Array<ReturnType<typeof sql>>;
      const rows = await db.select({ slug: profiles.slug, name: profiles.name, role: profiles.role, city: profiles.city, neighborhood: profiles.neighborhood, rating: profiles.rating, reviewCount: profiles.reviewCount, verified: profiles.verified, gold: profiles.gold, sos: profiles.sos, availability: profiles.availability, whatsapp: profiles.whatsapp, avatarUrl: profiles.avatarUrl, coverUrl: profiles.coverUrl, bio: profiles.bio }).from(profiles).where(conditions.length ? sql.join(conditions, sql` and `) : undefined).limit(60);
      return [...local, ...rows.map(row => ({ ...row, rating: Number(row.rating), reviews: row.reviewCount, verified: Boolean(row.verified), gold: Boolean(row.gold), sos: Boolean(row.sos) }))];
    }),
    professionSuggestions: publicProcedure.input(z.object({ query: z.string().optional() }).optional()).query(async ({ input }) => {
      const query = normalizeProfession(input?.query ?? "");
      const fallback = defaultProfessions.filter(name => !query || normalizeProfession(name).includes(query));
      const db = await getDb();
      if (!db) return fallback;
      const rows = await db.select({ name: serviceCategories.name }).from(serviceCategories).where(query ? like(serviceCategories.normalizedName, `%${query}%`) : undefined).limit(12);
      return Array.from(new Set([...rows.map(row => row.name), ...fallback])).slice(0, 12);
    }),
    createProfession: publicProcedure.input(z.object({ name: z.string().min(2).max(160) })).mutation(async ({ input, ctx }) => {
      const name = input.name.trim().replace(/\s+/g, " ");
      const normalizedName = normalizeProfession(name);
      const slug = slugify(name);
      const db = await getDb();
      if (db) {
        const existing = await db.select().from(serviceCategories).where(eq(serviceCategories.normalizedName, normalizedName)).limit(1);
        if (existing[0]) return existing[0];
        const [created] = await db.insert(serviceCategories).values({ name, normalizedName, slug, createdByUserId: ctx.user?.id ?? null }).$returningId();
        return { id: created.id, name, normalizedName, slug };
      }
      return { id: 0, name, normalizedName, slug };
    }),
    createProfile: protectedProcedure.input(z.object({ name: z.string().min(2).max(160), whatsapp: z.string().min(8).max(32), profession: z.string().min(2).max(160), city: z.string().min(2).max(120), neighborhood: z.string().max(120).optional(), age: z.number().int().min(18).max(110).optional(), avatarUrl: z.string().url().optional(), referralCode: z.string().max(40).optional() })).mutation(async ({ input, ctx }) => {
      const profession = input.profession.trim().replace(/\s+/g, " ");
      const normalizedName = normalizeProfession(profession);
      const categorySlug = slugify(profession);
      const slug = `${slugify(input.name)}-${slugify(input.city)}`.slice(0, 130);
      const db = await getDb();
      if (db) {
        const category = await db.select().from(serviceCategories).where(eq(serviceCategories.normalizedName, normalizedName)).limit(1);
        if (!category[0]) await db.insert(serviceCategories).values({ name: profession, normalizedName, slug: categorySlug, createdByUserId: ctx.user?.id ?? null });
        await db.insert(profiles).values({ userId: ctx.user?.id ?? null, slug, name: input.name.trim(), role: profession, city: input.city.trim(), neighborhood: input.neighborhood?.trim() || null, whatsapp: input.whatsapp.replace(/\D/g, ""), avatarUrl: input.avatarUrl, bio: `Atendimento de ${profession.toLocaleLowerCase("pt-BR")} em ${input.city}.`, availability: "open", referralCode: input.referralCode?.trim().toUpperCase() || null });
        if (input.referralCode?.trim()) {
          const code = input.referralCode.trim().toUpperCase();
          const existing = await db.select().from(ambassadors).where(eq(ambassadors.code, code)).limit(1);
          if (existing[0]) await db.update(ambassadors).set({ referralCount: sql`${ambassadors.referralCount} + 1` }).where(eq(ambassadors.code, code));
          else await db.insert(ambassadors).values({ code, name: `Embaixador ${code}`, referralCount: 1 });
        }
      }
      return { slug, name: input.name.trim(), role: profession, city: input.city.trim(), neighborhood: input.neighborhood?.trim() ?? "", whatsapp: input.whatsapp.replace(/\D/g, ""), avatarUrl: input.avatarUrl ?? "", age: input.age ?? null, referralCode: input.referralCode?.trim().toUpperCase() ?? "", published: true };
    }),
    myProfiles: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: profiles.id, slug: profiles.slug, name: profiles.name, role: profiles.role, city: profiles.city, neighborhood: profiles.neighborhood, whatsapp: profiles.whatsapp, avatarUrl: profiles.avatarUrl, sos: profiles.sos, verified: profiles.verified, gold: profiles.gold }).from(profiles).where(eq(profiles.userId, ctx.user.id));
    }),
    updateProfile: protectedProcedure.input(z.object({ id: z.number().int().positive(), role: z.string().min(2).max(160), whatsapp: z.string().min(8).max(32), neighborhood: z.string().max(120).optional(), city: z.string().min(2).max(120) })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await db.update(profiles).set({ role: input.role.trim(), whatsapp: input.whatsapp.replace(/\D/g, ""), neighborhood: input.neighborhood?.trim() || null, city: input.city.trim() }).where(sql`${profiles.id} = ${input.id} AND ${profiles.userId} = ${ctx.user.id}`);
      return { id: input.id, updated: true };
    }),
    setSos: protectedProcedure.input(z.object({ slug: z.string(), enabled: z.boolean() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await db.update(profiles).set({ sos: input.enabled ? 1 : 0 }).where(sql`${profiles.slug} = ${input.slug} AND ${profiles.userId} = ${ctx.user.id}`);
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
  payments: router({
    products: publicProcedure.query(() => PRODUCTS),
    processTestEvent: adminProcedure.input(z.object({ eventId: z.string().min(3), type: z.string().min(3), product: z.enum(["gold", "sponsored_spot"]), profileSlug: z.string().optional(), storeId: z.number().optional() })).mutation(async ({ input }) => fulfillStripeEvent({ id: input.eventId, type: input.type, data: { object: { id: input.eventId, payment_status: "paid", amount_total: PRODUCTS[input.product].amountCents, currency: "brl", payment_method_types: ["card"], metadata: { product: input.product, profileSlug: input.profileSlug, storeId: input.storeId ? String(input.storeId) : undefined } } } })),
    status: publicProcedure.input(z.object({ targetKey: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { targetKey: input.targetKey, status: "demo" as const, source: "payment" as const };
      const result = await db.select().from(entitlements).where(eq(entitlements.targetKey, input.targetKey)).limit(1);
      return result[0] ?? { targetKey: input.targetKey, status: "revoked" as const, source: "payment" as const };
    }),
  }),
  admin: router({
    entitlements: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [{ targetKey: "profile:carlos-piscineiro", kind: "gold", status: "active", source: "payment", manualOverride: "none" }];
      return db.select().from(entitlements);
    }),
    override: adminProcedure.input(z.object({ kind: z.enum(["gold", "sponsored_spot"]), profileSlug: z.string().optional(), storeId: z.number().optional(), action: z.enum(["grant", "revoke"]), reason: z.string().max(255).optional() })).mutation(async ({ input, ctx }) => applyManualOverride({ ...input, adminUserId: ctx.user.id })),
    ambassadors: adminProcedure.query(async () => { const db = await getDb(); if (!db) return [{ code: "LEFIND10", name: "Programa LE.FIND", referralCount: 0 }]; return db.select().from(ambassadors); }),
  }),
});

export type AppRouter = typeof appRouter;
