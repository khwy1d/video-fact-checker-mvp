import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum        = pgEnum("role",           ["user", "admin"]);
export const statusEnum      = pgEnum("analysisStatus", ["pending", "processing", "completed", "failed"]);
export const verdictEnum     = pgEnum("verdict",        ["صحيح", "غير مدعوم", "مضلل"]);
export const sourceTypeEnum  = pgEnum("sourceType",     ["supporting", "contradicting", "neutral"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  openId:       varchar("openId", { length: 64 }).notNull().unique(),
  name:         text("name"),
  email:        varchar("email", { length: 320 }),
  loginMethod:  varchar("loginMethod", { length: 64 }),
  role:         roleEnum("role").default("user").notNull(),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
  updatedAt:    timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User       = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Analyses ─────────────────────────────────────────────────────────────────
export const analyses = pgTable("analyses", {
  id:              serial("id").primaryKey(),
  userId:          integer("userId").notNull(),
  videoUrl:        varchar("videoUrl", { length: 2048 }).notNull(),
  videoTitle:      varchar("videoTitle", { length: 512 }),
  videoThumbnail:  varchar("videoThumbnail", { length: 2048 }),
  transcriptText:  text("transcriptText"),
  ocrText:         text("ocrText"),
  mergedContent:   text("mergedContent"),
  analysisStatus:  statusEnum("analysisStatus").default("pending").notNull(),
  errorMessage:    text("errorMessage"),
  createdAt:       timestamp("createdAt").defaultNow().notNull(),
  completedAt:     timestamp("completedAt"),
  updatedAt:       timestamp("updatedAt").defaultNow().notNull(),
});

export type Analysis       = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

// ─── Claims ───────────────────────────────────────────────────────────────────
export const claims = pgTable("claims", {
  id:          serial("id").primaryKey(),
  analysisId:  integer("analysisId").notNull(),
  claimText:   text("claimText").notNull(),
  claimOrder:  integer("claimOrder"),
  verdict:     verdictEnum("verdict"),
  explanation: text("explanation"),
  confidence:  integer("confidence"),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().notNull(),
});

export type Claim       = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

// ─── Sources ──────────────────────────────────────────────────────────────────
export const sources = pgTable("sources", {
  id:             serial("id").primaryKey(),
  claimId:        integer("claimId").notNull(),
  sourceUrl:      varchar("sourceUrl", { length: 2048 }).notNull(),
  sourceTitle:    varchar("sourceTitle", { length: 512 }),
  sourceSnippet:  text("sourceSnippet"),
  relevanceScore: integer("relevanceScore"),
  sourceType:     sourceTypeEnum("sourceType").default("neutral"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
});

export type Source       = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;
