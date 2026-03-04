import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  // 1. Verify review exists and is in "pending" status
  const [review] = await db
    .select()
    .from(schema.scriptReviews)
    .where(and(
      eq(schema.scriptReviews.id, id),
      eq(schema.scriptReviews.reviewStatus, "pending")
    ))
    .limit(1);

  if (!review) {
    return NextResponse.json(
      { error: "Script review not found or already triggered" },
      { status: 400 }
    );
  }

  // 2. Get workflow config
  const config = await getAppConfig();
  if (!config) {
    return NextResponse.json({ error: "Portal not configured" }, { status: 500 });
  }

  const workflowConfig = config.workflows?.script_review;
  if (!workflowConfig?.webhook_path) {
    return NextResponse.json({ error: "Script review workflow not configured" }, { status: 500 });
  }

  const n8nBaseUrl = workflowConfig.n8n_base_url || process.env.N8N_BASE_URL;
  const webhookUrl = `${n8nBaseUrl}/webhook/${workflowConfig.webhook_path}?recordId=${id}`;

  // 3. Update status to "under_review"
  await db
    .update(schema.scriptReviews)
    .set({
      reviewStatus: "under_review",
      updatedAt: new Date(),
    })
    .where(eq(schema.scriptReviews.id, id));

  // 4. Fire GET request to n8n webhook (fire-and-forget)
  try {
    fetch(webhookUrl, { method: "GET" }).catch((err) => {
      console.error("Failed to trigger n8n webhook:", err);
    });
  } catch (err) {
    console.error("Failed to send webhook:", err);
  }

  // 5. Log activity
  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "script_review_triggered",
    resourceType: "script_review",
    resourceId: id,
    details: { webhookUrl: workflowConfig.webhook_path },
  });

  return NextResponse.json({ status: "under_review", scriptReviewId: id });
}
