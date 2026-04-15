import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { toAccessibleUrl, r2KeyFromUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * GET /api/video-generation/gallery
 * List completed video generations with presigned URLs.
 */
export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select()
    .from(schema.videoGenerations)
    .where(eq(schema.videoGenerations.status, "completed"))
    .orderBy(desc(schema.videoGenerations.createdAt));

  const withPreviews = await Promise.all(
    rows.map(async (row) => {
      let videoPreviewUrl = row.videoUrl;
      if (row.videoUrl && r2KeyFromUrl(row.videoUrl)) {
        videoPreviewUrl = await toAccessibleUrl(row.videoUrl);
      }
      return { ...row, videoPreviewUrl };
    })
  );

  return NextResponse.json(withPreviews);
}
