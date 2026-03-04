import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  reviewStatus: z.enum(["draft", "approved", "revision_needed", "in_production", "rejected"]),
  reviewNotes: z.string().optional(),
});

// POST /api/scripts/[id]/review — submit review decision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [script] = await db
    .select()
    .from(schema.generatedScripts)
    .where(eq(schema.generatedScripts.id, id))
    .limit(1);

  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(schema.generatedScripts)
    .set({
      reviewStatus: parsed.data.reviewStatus,
      reviewNotes: parsed.data.reviewNotes || null,
      reviewedAt: new Date(),
      reviewedBy: auth.portalUser.id,
      updatedAt: new Date(),
    })
    .where(eq(schema.generatedScripts.id, id))
    .returning();

  // Log activity
  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: `script_${parsed.data.reviewStatus}`,
    resourceType: "script",
    resourceId: id,
  });

  return NextResponse.json(updated);
}
