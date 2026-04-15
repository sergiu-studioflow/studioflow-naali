import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/briefs/callback
 * Called by n8n Brief Generator workflow when generation is complete.
 * Body: { briefId, success, brief, model, durationMs, error }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { briefId, success, brief, model, durationMs, error } = body;

  if (!briefId) {
    return NextResponse.json({ error: "briefId is required" }, { status: 400 });
  }

  // Verify the brief exists
  const [existing] = await db
    .select({ id: schema.generatedBriefs.id, status: schema.generatedBriefs.status })
    .from(schema.generatedBriefs)
    .where(eq(schema.generatedBriefs.id, briefId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  if (!success || !brief) {
    await db
      .update(schema.generatedBriefs)
      .set({
        status: "error",
        errorMessage: error || "AI did not return a valid brief",
        updatedAt: new Date(),
      })
      .where(eq(schema.generatedBriefs.id, briefId));
    return NextResponse.json({ ok: true, status: "error" });
  }

  // Update the brief row with all parsed fields
  await db
    .update(schema.generatedBriefs)
    .set({
      title: brief.title || "Untitled Brief",
      mediaType: brief.media_type || "static",
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
      aiModel: model || null,
      generationDurationMs: durationMs || null,
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.generatedBriefs.id, briefId));

  return NextResponse.json({ ok: true, status: "complete" });
}
