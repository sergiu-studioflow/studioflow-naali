import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc, eq, and, isNotNull, sql } from "drizzle-orm";
import { toAccessibleUrl } from "@/lib/r2";
import { sweepGeneratingRows } from "@/lib/static-ads/poll-and-persist";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const status = req.nextUrl.searchParams.get("status");
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "100"), 200);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

    // Resolve any rows stuck on 'generating' because the user closed the
    // generator tab while Kie was still processing. Frontend per-tile
    // polling lives only in unified-generator; without this sweep, stuck
    // rows sit forever (observed 28h on DNA portal).
    await sweepGeneratingRows({});

    const conditions = [];
    if (status && status !== "all") {
      // Explicit filter (Completed / Generating / Error) — show whatever was asked for.
      conditions.push(eq(schema.staticAdGenerations.status, status));
      if (status === "completed") {
        conditions.push(isNotNull(schema.staticAdGenerations.imageUrl));
      }
    } else {
      // Default "All" view: hide stuck-generating + previewless + non-R2 rows.
      conditions.push(eq(schema.staticAdGenerations.status, "completed"));
      conditions.push(isNotNull(schema.staticAdGenerations.imageUrl));
      conditions.push(
        sql`(${schema.staticAdGenerations.imageUrl} LIKE '%r2.dev%' OR ${schema.staticAdGenerations.imageUrl} LIKE '%r2.cloudflarestorage.com%' OR ${schema.staticAdGenerations.imageUrl} LIKE '%studio-flow.co%')`
      );
    }

    const generations = await db
      .select()
      .from(schema.staticAdGenerations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.staticAdGenerations.createdAt))
      .limit(limit)
      .offset(offset);

    // Generate presigned URLs for images (R2 bucket is private)
    const withAccessibleUrls = await Promise.all(
      generations.map(async (gen) => ({
        ...gen,
        imageUrl: gen.imageUrl ? await toAccessibleUrl(gen.imageUrl) : null,
        thumbnailUrl: gen.thumbnailUrl ? await toAccessibleUrl(gen.thumbnailUrl) : null,
      }))
    );

    return NextResponse.json(withAccessibleUrls);
  } catch (err) {
    console.error("[static-ads/gallery]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
