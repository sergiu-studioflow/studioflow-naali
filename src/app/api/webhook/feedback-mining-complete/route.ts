import { db, schema } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Authenticate via webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { miningRunId, angles, reviewsAnalyzed } = body;

  if (!miningRunId || !angles || !Array.isArray(angles)) {
    return NextResponse.json(
      { error: "miningRunId and angles array required" },
      { status: 400 }
    );
  }

  // Batch insert mined angles
  const angleValues = angles.map((angle: Record<string, unknown>) => ({
    miningRunId,
    angleName: (angle.angleName || angle.angle_name || "Untitled Angle") as string,
    targetPersona: (angle.targetPersona || angle.target_persona || null) as string | null,
    awarenessLevel: (angle.awarenessLevel || angle.awareness_level || null) as string | null,
    keyInsight: (angle.keyInsight || angle.key_insight || "") as string,
    supportingQuotes: (angle.supportingQuotes || angle.supporting_quotes || null) as unknown,
    painPointCluster: (angle.painPointCluster || angle.pain_point_cluster || null) as string | null,
    emotionalTrigger: (angle.emotionalTrigger || angle.emotional_trigger || null) as string | null,
    complianceNotes: (angle.complianceNotes || angle.compliance_notes || null) as string | null,
    suggestedHookDirection: (angle.suggestedHookDirection || angle.suggested_hook_direction || null) as string | null,
    suggestedAngleType: (angle.suggestedAngleType || angle.suggested_angle_type || null) as string | null,
    reviewsAnalyzed: (reviewsAnalyzed || angle.reviewsAnalyzed || angle.reviews_analyzed || null) as number | null,
    confidence: (angle.confidence || null) as string | null,
    status: "new",
  }));

  if (angleValues.length > 0) {
    await db.insert(schema.minedAngles).values(angleValues);
  }

  // Log activity
  await db.insert(schema.activityLog).values({
    action: "feedback_mining_complete",
    resourceType: "feedback_mining",
    details: { miningRunId, anglesCount: angleValues.length, reviewsAnalyzed },
  });

  return NextResponse.json({ ok: true, anglesCreated: angleValues.length });
}
