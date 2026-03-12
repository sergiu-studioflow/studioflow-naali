import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const config = await getAppConfig();
  const workflowConfig = config?.workflows?.feedback_mining;
  if (!workflowConfig?.webhook_path) {
    return NextResponse.json(
      { error: "Feedback mining workflow not configured" },
      { status: 500 }
    );
  }

  const n8nBaseUrl = workflowConfig.n8n_base_url || process.env.N8N_BASE_URL;
  const miningRunId = `run-${Date.now()}`;
  const webhookUrl = `${n8nBaseUrl}/webhook/${workflowConfig.webhook_path}?miningRunId=${miningRunId}`;

  // Fire-and-forget GET to n8n webhook
  try {
    fetch(webhookUrl, { method: "GET" }).catch((err) => {
      console.error("Failed to trigger n8n feedback mining webhook:", err);
    });
  } catch (err) {
    console.error("Failed to send webhook:", err);
  }

  // Log activity
  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "feedback_mining_triggered",
    resourceType: "feedback_mining",
    details: { miningRunId, webhookUrl: workflowConfig.webhook_path },
  });

  return NextResponse.json({ status: "processing", miningRunId });
}
