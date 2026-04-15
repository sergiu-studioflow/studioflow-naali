import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/briefs
 * List all generated briefs, ordered by newest first.
 * Optional query params: sourceType, mediaType, status
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(req.url);
  const sourceType = searchParams.get("sourceType");
  const mediaType = searchParams.get("mediaType");
  const status = searchParams.get("status");

  const conditions = [];
  if (sourceType) conditions.push(eq(schema.generatedBriefs.sourceType, sourceType));
  if (mediaType) conditions.push(eq(schema.generatedBriefs.mediaType, mediaType));
  if (status) conditions.push(eq(schema.generatedBriefs.status, status));

  const briefs = await db
    .select({
      id: schema.generatedBriefs.id,
      sourceType: schema.generatedBriefs.sourceType,
      sourceId: schema.generatedBriefs.sourceId,
      title: schema.generatedBriefs.title,
      mediaType: schema.generatedBriefs.mediaType,
      creativeFormat: schema.generatedBriefs.creativeFormat,
      funnelStage: schema.generatedBriefs.funnelStage,
      primaryHook: schema.generatedBriefs.primaryHook,
      targetPersona: schema.generatedBriefs.targetPersona,
      status: schema.generatedBriefs.status,
      aiModel: schema.generatedBriefs.aiModel,
      generationDurationMs: schema.generatedBriefs.generationDurationMs,
      createdAt: schema.generatedBriefs.createdAt,
    })
    .from(schema.generatedBriefs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.generatedBriefs.createdAt));

  return NextResponse.json(briefs);
}
