import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, analyses, claims, sources } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    // PostgreSQL uses onConflictDoUpdate instead of onDuplicateKeyUpdate
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAnalysis(userId: number, videoUrl: string, videoTitle?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.insert(analyses).values({
    userId, videoUrl,
    videoTitle: videoTitle || 'Unknown',
    analysisStatus: 'processing',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: analyses.id });
}

export async function getAnalysisById(analysisId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAnalysisStatus(
  analysisId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed'
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(analyses).set({ analysisStatus: status, updatedAt: new Date() }).where(eq(analyses.id, analysisId));
}

export async function createClaim(
  analysisId: number, claimText: string,
  verdict: 'صحيح' | 'غير مدعوم' | 'مضلل',
  explanation: string, confidence: number
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.insert(claims).values({
    analysisId, claimText, verdict, explanation, confidence,
    createdAt: new Date(), updatedAt: new Date(),
  }).returning({ id: claims.id });
}

export async function createSource(
  claimId: number, sourceUrl: string, sourceTitle: string,
  sourceSnippet: string,
  sourceType: 'supporting' | 'contradicting' | 'neutral' = 'neutral'
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.insert(sources).values({
    claimId, sourceUrl, sourceTitle, sourceSnippet, sourceType, createdAt: new Date(),
  }).returning({ id: sources.id });
}

export async function getClaimsByAnalysisId(analysisId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(claims).where(eq(claims.analysisId, analysisId));
}

export async function getSourcesByClaimId(claimId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(sources).where(eq(sources.claimId, claimId));
}
