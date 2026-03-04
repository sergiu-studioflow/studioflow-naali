import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    recordId,
    aiAwarenessLevel,
    awarenessMismatch,
    awarenessAnalysis,
    complianceStatus,
    complianceIssues,
    correctedScript,
    changesSummary,
    brandVoiceAlignment,
    overallScore,
  } = body;

  if (!recordId) {
    return NextResponse.json({ error: "recordId required" }, { status: 400 });
  }

  await db
    .update(schema.scriptReviews)
    .set({
      reviewStatus: "review_complete",
      aiAwarenessLevel: aiAwarenessLevel ? Number(aiAwarenessLevel) : null,
      awarenessMismatch: awarenessMismatch === true || awarenessMismatch === "true",
      awarenessAnalysis,
      complianceStatus,
      complianceIssues,
      correctedScript,
      changesSummary,
      brandVoiceAlignment,
      overallScore: overallScore ? Number(overallScore) : null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.scriptReviews.id, recordId));

  await db.insert(schema.activityLog).values({
    action: "script_review_completed",
    resourceType: "script_review",
    resourceId: recordId,
  });

  return NextResponse.json({ ok: true, recordId });
}
