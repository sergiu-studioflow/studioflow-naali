import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webhook/video-brief-complete — called by n8n when video brief generation finishes
export async function POST(request: NextRequest) {
  // Authenticate via webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    videoBriefRequestId,
    briefTitle,
    strategicHypothesis,
    psychologyAngle,
    contentType,
    targetPersona,
    awarenessLevel,
    platform,
    duration,
    primaryHook,
    hookVariationsText,
    shotList,
    bRollRequirements,
    talentNotes,
    locationRequirements,
    propsList,
    musicDirection,
    soundDesign,
    onScreenText,
    visualDirection,
    complianceReview,
    brandVoiceLock,
    productionNotes,
  } = body;

  if (!videoBriefRequestId) {
    return NextResponse.json({ error: "videoBriefRequestId required" }, { status: 400 });
  }

  // 1. Insert generated video brief
  const [videoBrief] = await db
    .insert(schema.generatedVideoBriefs)
    .values({
      videoBriefRequestId,
      briefTitle,
      strategicHypothesis,
      psychologyAngle,
      contentType,
      targetPersona,
      awarenessLevel,
      platform,
      duration,
      primaryHook,
      hookVariationsText,
      shotList,
      bRollRequirements,
      talentNotes,
      locationRequirements,
      propsList,
      musicDirection,
      soundDesign,
      onScreenText,
      visualDirection,
      complianceReview,
      brandVoiceLock,
      productionNotes,
    })
    .returning();

  // 2. Update request status to "complete"
  await db
    .update(schema.videoBriefRequests)
    .set({
      status: "complete",
      updatedAt: new Date(),
    })
    .where(eq(schema.videoBriefRequests.id, videoBriefRequestId));

  // 3. Log activity
  await db.insert(schema.activityLog).values({
    action: "video_brief_generated",
    resourceType: "video_brief",
    resourceId: videoBrief.id,
    details: { videoBriefRequestId, briefTitle },
  });

  return NextResponse.json({ ok: true, videoBriefId: videoBrief.id });
}
