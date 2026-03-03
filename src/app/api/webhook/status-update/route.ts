import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/webhook/status-update — generic status update from n8n
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { briefId, status, errorMessage } = body;

  if (!briefId || !status) {
    return NextResponse.json({ error: "briefId and status required" }, { status: 400 });
  }

  await db
    .update(schema.contentBriefs)
    .set({
      status,
      errorMessage: errorMessage || null,
      updatedAt: new Date(),
      ...(status === "complete" ? { completedAt: new Date() } : {}),
    })
    .where(eq(schema.contentBriefs.id, briefId));

  return NextResponse.json({ ok: true });
}
