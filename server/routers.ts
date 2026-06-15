import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createAnalysis, 
  getAnalysisById, 
  updateAnalysisStatus,
  getClaimsByAnalysisId,
  getSourcesByClaimId,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  analysis: router({
    startAnalysis: protectedProcedure
      .input(z.object({ videoUrl: z.string().url() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await createAnalysis(ctx.user!.id, input.videoUrl);
          const analysisId = (result as any)[0]?.id || 1;
          
          return {
            success: true,
            message: 'Analysis started',
            analysisId,
          };
        } catch (error) {
          console.error('Analysis error:', error);
          throw new Error(`Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    getAnalysis: protectedProcedure
      .input(z.object({ analysisId: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const analysis = await getAnalysisById(input.analysisId);
          
          if (!analysis) {
            throw new Error('Analysis not found');
          }

          if (analysis.userId !== ctx.user!.id) {
            throw new Error('Unauthorized');
          }

          const claimsData = await getClaimsByAnalysisId(input.analysisId);
          
          const claimsWithSources = await Promise.all(
            claimsData.map(async (claim) => {
              const sources = await getSourcesByClaimId(claim.id);
              return {
                id: claim.id,
                claimText: claim.claimText,
                verdict: claim.verdict || ('صحيح' as const),
                confidence: claim.confidence || 0,
                explanation: claim.explanation || '',
                sources: sources.map(s => ({
                  url: s.sourceUrl,
                  title: s.sourceTitle || '',
                  snippet: s.sourceSnippet || '',
                })),
              };
            })
          );

          return {
            id: analysis.id,
            videoTitle: analysis.videoTitle,
            videoUrl: analysis.videoUrl,
            status: analysis.analysisStatus,
            claims: claimsWithSources,
            transcript: analysis.transcriptText || '',
            ocrText: analysis.ocrText || '',
          };
        } catch (error) {
          throw new Error(`Failed to fetch analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    listAnalyses: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const db = await (await import('./db')).getDb();
          if (!db) {
            throw new Error('Database not available');
          }

          const { analyses } = await import('../drizzle/schema');
          const { eq } = await import('drizzle-orm');
          
          const userAnalyses = await db.select().from(analyses).where(eq(analyses.userId, ctx.user!.id));
          
          const result = await Promise.all(
            userAnalyses.map(async (analysis) => {
              const claimsData = await getClaimsByAnalysisId(analysis.id);
              return {
                id: analysis.id,
                videoTitle: analysis.videoTitle,
                videoUrl: analysis.videoUrl,
                status: analysis.analysisStatus,
                createdAt: analysis.createdAt,
                claimsCount: claimsData.length,
              };
            })
          );

          return result;
        } catch (error) {
          throw new Error(`Failed to fetch analyses: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
