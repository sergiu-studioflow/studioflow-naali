import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { getAppConfig } from "@/lib/config";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/briefs/generate
 * Generate an on-brand creative brief from a competitor ad or organic post.
 * Body: { sourceType: 'competitor_ad' | 'organic_post', sourceId: number }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot generate briefs" }, { status: 403 });
  }

  const body = await req.json();
  const { sourceType, sourceId } = body;

  if (!sourceType || !sourceId) {
    return NextResponse.json({ error: "sourceType and sourceId are required" }, { status: 400 });
  }

  if (sourceType !== "competitor_ad" && sourceType !== "organic_post") {
    return NextResponse.json({ error: "sourceType must be 'competitor_ad' or 'organic_post'" }, { status: 400 });
  }

  // Fetch source data
  let sourceData: Record<string, unknown> | null = null;
  let mediaType = "static";

  if (sourceType === "competitor_ad") {
    const [ad] = await db
      .select()
      .from(schema.competitorAds)
      .where(eq(schema.competitorAds.id, sourceId))
      .limit(1);
    if (!ad) {
      return NextResponse.json({ error: "Competitor ad not found" }, { status: 404 });
    }
    sourceData = ad as unknown as Record<string, unknown>;
    const mt = (ad.mediaType || "").toLowerCase();
    mediaType = mt.includes("video") ? "video" : mt.includes("carousel") ? "carousel" : "static";
  } else {
    const [post] = await db
      .select()
      .from(schema.organicPosts)
      .where(eq(schema.organicPosts.id, sourceId))
      .limit(1);
    if (!post) {
      return NextResponse.json({ error: "Organic post not found" }, { status: 404 });
    }
    sourceData = post as unknown as Record<string, unknown>;
    const ct = (post.contentType || "").toLowerCase();
    mediaType = ct.includes("video") ? "video" : ct.includes("carousel") ? "carousel" : "static";
  }

  // Fetch brand intelligence
  const [brandIntel] = await db
    .select()
    .from(schema.brandIntelligence)
    .limit(1);
  const brandIntelligence = brandIntel?.rawContent || null;

  // Insert brief row with status "generating"
  const [briefRow] = await db
    .insert(schema.generatedBriefs)
    .values({
      userId: auth.portalUser.id,
      sourceType,
      sourceId,
      sourceSnapshot: sourceData,
      title: "Generating...",
      mediaType,
      fullBrief: {},
      status: "generating",
    })
    .returning();

  // Build webhook URL from app config
  const config = await getAppConfig();
  const wfConfig = config?.workflows?.brief_generator;
  const webhookUrl = typeof wfConfig === "string"
    ? wfConfig
    : wfConfig?.webhook_path
      ? `${wfConfig.n8n_base_url || "https://studio-flow.app.n8n.cloud/webhook"}/${wfConfig.webhook_path}`
      : null;

  if (!webhookUrl) {
    await db
      .update(schema.generatedBriefs)
      .set({ status: "error", errorMessage: "Brief generator webhook not configured", updatedAt: new Date() })
      .where(eq(schema.generatedBriefs.id, briefRow.id));
    return NextResponse.json({ error: "Brief generator webhook not configured. Add 'brief_generator' to app_config workflows." }, { status: 500 });
  }

  // Call n8n webhook synchronously (wait for brief generation)
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType,
        sourceData,
        brandIntelligence,
        mediaType,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      await db
        .update(schema.generatedBriefs)
        .set({ status: "error", errorMessage: `n8n returned ${res.status}: ${errText.substring(0, 500)}`, updatedAt: new Date() })
        .where(eq(schema.generatedBriefs.id, briefRow.id));
      return NextResponse.json({ error: "Brief generation failed", briefId: briefRow.id }, { status: 502 });
    }

    const result = await res.json();

    if (!result.success || !result.brief) {
      const errorMsg = result.error || "AI did not return a valid brief";
      await db
        .update(schema.generatedBriefs)
        .set({ status: "error", errorMessage: errorMsg, updatedAt: new Date() })
        .where(eq(schema.generatedBriefs.id, briefRow.id));
      return NextResponse.json({ error: errorMsg, briefId: briefRow.id }, { status: 422 });
    }

    const brief = result.brief;

    // Update the brief row with all parsed fields
    const [updated] = await db
      .update(schema.generatedBriefs)
      .set({
        title: brief.title || "Untitled Brief",
        mediaType: brief.media_type || mediaType,
        creativeFormat: brief.creative_format || null,
        funnelStage: brief.funnel_stage || null,
        strategicHypothesis: brief.strategic_hypothesis || null,
        psychologyAngle: brief.psychology_angle || null,
        primaryHook: brief.primary_hook || null,
        hookVariations: brief.hook_variations || null,
        visualDirection: brief.visual_direction || null,
        shotList: brief.shot_list || null,
        visualComposition: brief.visual_composition || null,
        cardDirections: brief.card_directions || null,
        onScreenText: brief.on_screen_text || null,
        audioDirection: brief.audio_direction || null,
        brandVoiceLock: brief.brand_voice_lock || null,
        complianceRequirements: brief.compliance_requirements || null,
        targetPersona: brief.target_persona || null,
        lockedElements: brief.locked_elements || null,
        variableElements: brief.variable_elements || null,
        fullBrief: brief,
        status: "complete",
        aiModel: result.model || null,
        generationDurationMs: result.durationMs || null,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.generatedBriefs.id, briefRow.id))
      .returning();

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to reach n8n webhook";
    await db
      .update(schema.generatedBriefs)
      .set({ status: "error", errorMessage, updatedAt: new Date() })
      .where(eq(schema.generatedBriefs.id, briefRow.id));
    return NextResponse.json({ error: "Failed to reach brief generator", briefId: briefRow.id }, { status: 502 });
  }
}
