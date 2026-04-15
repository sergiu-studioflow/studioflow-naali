import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, asc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/competitor-ads?competitor_page_id=xxx&snapshot_id=yyy
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const competitorPageId = searchParams.get("competitor_page_id");
  const snapshotId = searchParams.get("snapshot_id");

  // If no filters, return available snapshots for the dropdown
  if (!competitorPageId && !snapshotId) {
    const snapshots = await db
      .selectDistinct({
        snapshotId: schema.competitorAds.snapshotId,
        snapshotLabel: schema.competitorAds.snapshotLabel,
        competitorPageId: schema.competitorAds.competitorPageId,
        brandPageName: schema.competitorAds.brandPageName,
      })
      .from(schema.competitorAds)
      .orderBy(desc(schema.competitorAds.snapshotId));

    return NextResponse.json({ snapshots });
  }

  // Build query conditions
  const conditions = [];
  if (competitorPageId) {
    conditions.push(eq(schema.competitorAds.competitorPageId, competitorPageId));
  }
  if (snapshotId) {
    conditions.push(eq(schema.competitorAds.snapshotId, snapshotId));
  }

  // If only competitor_page_id given, find the latest snapshot first
  let effectiveSnapshotId = snapshotId;
  if (competitorPageId && !snapshotId) {
    const [latest] = await db
      .selectDistinct({ snapshotId: schema.competitorAds.snapshotId })
      .from(schema.competitorAds)
      .where(eq(schema.competitorAds.competitorPageId, competitorPageId))
      .orderBy(desc(schema.competitorAds.snapshotId))
      .limit(1);

    if (!latest) {
      return NextResponse.json({ ads: [], snapshots: [] });
    }
    effectiveSnapshotId = latest.snapshotId;
  }

  // Fetch ads for this snapshot with deterministic sort order
  const ads = await db
    .select()
    .from(schema.competitorAds)
    .where(
      effectiveSnapshotId
        ? eq(schema.competitorAds.snapshotId, effectiveSnapshotId)
        : sql`1=1`
    )
    .orderBy(
      asc(schema.competitorAds.metaSortRank),
      desc(schema.competitorAds.adStartDate),
      asc(schema.competitorAds.adArchiveId)
    );

  // Fetch all snapshots for this competitor (for the dropdown)
  const snapshots = await db
    .selectDistinct({
      snapshotId: schema.competitorAds.snapshotId,
      snapshotLabel: schema.competitorAds.snapshotLabel,
    })
    .from(schema.competitorAds)
    .where(
      competitorPageId
        ? eq(schema.competitorAds.competitorPageId, competitorPageId)
        : sql`1=1`
    )
    .orderBy(desc(schema.competitorAds.snapshotId));

  return NextResponse.json({
    ads,
    snapshots,
    currentSnapshotId: effectiveSnapshotId,
  });
}
