import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webhook/script-complete — called by n8n when script generation finishes
export async function POST(request: NextRequest) {
  // Authenticate via webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    briefId,
    scriptTitle,
    contentType,
    fullScript,
    thinkingSequence,
    dialogue,
    sceneBreakdown,
    visualDirection,
    audioDirection,
    onScreenText,
    emotionalArc,
    complianceReview,
    medicalContextUsed,
    platform,
    duration,
    hookVariations,
  } = body;

  if (!briefId) {
    return NextResponse.json({ error: "briefId required" }, { status: 400 });
  }

  // 1. Insert generated script
  const [script] = await db
    .insert(schema.generatedScripts)
    .values({
      briefId,
      scriptTitle,
      contentType,
      fullScript,
      thinkingSequence,
      dialogue,
      sceneBreakdown,
      visualDirection,
      audioDirection,
      onScreenText,
      emotionalArc,
      complianceReview,
      medicalContextUsed,
      platform,
      duration,
    })
    .returning();

  // 2. Insert hook variations
  if (hookVariations && Array.isArray(hookVariations)) {
    for (let i = 0; i < hookVariations.length; i++) {
      const hook = hookVariations[i];
      await db.insert(schema.hookVariations).values({
        scriptId: script.id,
        hookTitle: hook.hookTitle || hook.hook_title,
        hookType: hook.hookType || hook.hook_type,
        hookText: hook.hookText || hook.hook_text,
        visualDescription: hook.visualDescription || hook.visual_description,
        whyItWorks: hook.whyItWorks || hook.why_it_works,
        platformBestFit: hook.platformBestFit || hook.platform_best_fit,
        estimatedStopRate: hook.estimatedStopRate || hook.estimated_stop_rate,
        sortOrder: i,
      });
    }
  }

  // 3. Update brief status to "complete"
  await db
    .update(schema.contentBriefs)
    .set({
      status: "complete",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.contentBriefs.id, briefId));

  // 4. Log activity
  await db.insert(schema.activityLog).values({
    action: "script_generated",
    resourceType: "script",
    resourceId: script.id,
    details: { briefId, scriptTitle },
  });

  return NextResponse.json({ ok: true, scriptId: script.id });
}
