import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/video-briefs/[id]/trigger — trigger video brief generation via n8n webhook
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  // 1. Verify brief exists and is in "new" status
  const [brief] = await db
    .select()
    .from(schema.videoBriefRequests)
    .where(and(
      eq(schema.videoBriefRequests.id, id),
      eq(schema.videoBriefRequests.status, "new")
    ))
    .limit(1);

  if (!brief) {
    return NextResponse.json(
      { error: "Brief not found or already triggered" },
      { status: 400 }
    );
  }

  // 2. Get workflow config
  const config = await getAppConfig();
  if (!config) {
    return NextResponse.json({ error: "Portal not configured" }, { status: 500 });
  }

  const workflowConfig = config.workflows?.video_brief_generation;
  if (!workflowConfig?.webhook_path) {
    return NextResponse.json({ error: "Video brief generation workflow not configured" }, { status: 500 });
  }

  const n8nBaseUrl = workflowConfig.n8n_base_url || process.env.N8N_BASE_URL;
  const webhookUrl = `${n8nBaseUrl}/webhook/${workflowConfig.webhook_path}?recordId=${id}`;

  // 3. Update status to "processing"
  await db
    .update(schema.videoBriefRequests)
    .set({
      status: "processing",
      updatedAt: new Date(),
    })
    .where(eq(schema.videoBriefRequests.id, id));

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
    action: "video_brief_triggered",
    resourceType: "video_brief_request",
    resourceId: id,
    details: { webhookUrl: workflowConfig.webhook_path },
  });

  return NextResponse.json({ status: "processing", videoBriefRequestId: id });
}
