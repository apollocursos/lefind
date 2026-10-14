import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(), name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId"), slug: varchar("slug", { length: 140 }).notNull().unique(), name: varchar("name", { length: 160 }).notNull(), role: varchar("role", { length: 160 }).notNull(), bio: text("bio"), city: varchar("city", { length: 120 }).notNull(), neighborhood: varchar("neighborhood", { length: 120 }), avatarUrl: text("avatarUrl"), coverUrl: text("coverUrl"), verified: int("verified").default(0).notNull(), gold: int("gold").default(0).notNull(), sos: int("sos").default(0).notNull(), availability: mysqlEnum("availability", ["open", "next", "full"]).default("open").notNull(), rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(), reviewCount: int("reviewCount").default(0).notNull(), socialsJson: text("socialsJson"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(), ownerId: int("ownerId"), name: varchar("name", { length: 180 }).notNull(), category: varchar("category", { length: 100 }).notNull(), city: varchar("city", { length: 120 }).notNull(), neighborhood: varchar("neighborhood", { length: 120 }), description: text("description"), imageUrl: text("imageUrl"), productsJson: text("productsJson"), sponsored: int("sponsored").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(), ownerId: int("ownerId"), slug: varchar("slug", { length: 140 }).notNull().unique(), name: varchar("name", { length: 180 }).notNull(), visibility: mysqlEnum("visibility", ["public", "private"]).default("private").notNull(), city: varchar("city", { length: 120 }).notNull(), description: text("description"), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communityMembers = mysqlTable("communityMembers", {
  id: int("id").autoincrement().primaryKey(), communityId: int("communityId").notNull(), profileId: int("profileId").notNull(), status: mysqlEnum("status", ["pending", "approved", "blocked"]).default("pending").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(), profileId: int("profileId").notNull(), authorName: varchar("authorName", { length: 160 }).notNull(), rating: int("rating").notNull(), body: text("body").notNull(), verified: int("verified").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(), profileId: int("profileId"), storeId: int("storeId"), requesterName: varchar("requesterName", { length: 160 }).notNull(), requesterPhone: varchar("requesterPhone", { length: 40 }), description: text("description").notNull(), status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const sponsoredSpots = mysqlTable("sponsoredSpots", {
  id: int("id").autoincrement().primaryKey(), storeId: int("storeId").notNull(), keyword: varchar("keyword", { length: 120 }).notNull(), region: varchar("region", { length: 160 }).notNull(), budgetCents: int("budgetCents").default(0).notNull(), startsAt: timestamp("startsAt"), endsAt: timestamp("endsAt"), status: mysqlEnum("status", ["draft", "active", "paused", "finished"]).default("draft").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceReports = mysqlTable("serviceReports", {
  id: int("id").autoincrement().primaryKey(), profileId: int("profileId").notNull(), slug: varchar("slug", { length: 140 }).notNull().unique(), title: varchar("title", { length: 180 }).notNull(), summary: text("summary"), beforeUrl: text("beforeUrl"), afterUrl: text("afterUrl"), checklistJson: text("checklistJson"), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Store = typeof stores.$inferSelect;
