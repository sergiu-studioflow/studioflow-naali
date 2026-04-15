import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/competitor-ads/refresh — trigger n8n scrape (fire-and-forget)
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot trigger scrapes" }, { status: 403 });
  }

  const { sourceId } = await request.json();
  if (!sourceId) {
    return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
  }

  const [source] = await db
    .select()
    .from(schema.competitorSources)
    .where(eq(schema.competitorSources.id, sourceId))
    .limit(1);

  if (!source) {
    return NextResponse.json({ error: "Competitor source not found" }, { status: 404 });
  }

  const config = await getAppConfig();
  const wfConfig = config?.workflows?.competitor_ads_scraper;
  // Support both string URL and { webhook_path, n8n_base_url } formats
  const webhookUrl = typeof wfConfig === "string"
    ? wfConfig
    : wfConfig?.webhook_path
      ? `${wfConfig.n8n_base_url || "https://studio-flow.app.n8n.cloud/webhook"}/${wfConfig.webhook_path}`
      : null;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Scraper webhook not configured" }, { status: 500 });
  }

  // Get the latest snapshot BEFORE triggering (so frontend can detect when a new one appears)
  const [latestSnapshot] = await db
    .selectDistinct({ snapshotId: schema.competitorAds.snapshotId })
    .from(schema.competitorAds)
    .where(eq(schema.competitorAds.competitorPageId, source.competitorPageId))
    .orderBy(desc(schema.competitorAds.snapshotId))
    .limit(1);

  // Fire-and-forget: trigger webhook, don't wait for completion
  // n8n Cloud returns 200 immediately (before pipeline finishes)
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          meta_library_url: source.metaLibraryUrl,
          country: source.country,
        },
      ]),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to trigger scrape" }, { status: 502 });
    }

    // Update lastScrapedAt
    await db
      .update(schema.competitorSources)
      .set({ lastScrapedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.competitorSources.id, sourceId));

    return NextResponse.json({
      triggered: true,
      competitorPageId: source.competitorPageId,
      previousSnapshotId: latestSnapshot?.snapshotId || null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach n8n webhook" }, { status: 502 });
  }
}
