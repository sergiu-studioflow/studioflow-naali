import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/briefs/[id]/trigger — trigger script generation via n8n webhook
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
    .from(schema.contentBriefs)
    .where(and(
      eq(schema.contentBriefs.id, id),
      eq(schema.contentBriefs.status, "new")
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

  const workflowConfig = config.workflows?.script_generation;
  if (!workflowConfig?.webhook_path) {
    return NextResponse.json({ error: "Script generation workflow not configured" }, { status: 500 });
  }

  const n8nBaseUrl = workflowConfig.n8n_base_url || process.env.N8N_BASE_URL;
  const webhookUrl = `${n8nBaseUrl}/webhook/${workflowConfig.webhook_path}?recordId=${id}`;

  // 3. Update status to "processing"
  await db
    .update(schema.contentBriefs)
    .set({
      status: "processing",
      triggeredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.contentBriefs.id, id));

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
    action: "brief_triggered",
    resourceType: "brief",
    resourceId: id,
    details: { webhookUrl: workflowConfig.webhook_path },
  });

  return NextResponse.json({ status: "processing", briefId: id });
}
