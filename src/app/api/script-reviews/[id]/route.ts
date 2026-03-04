import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const [scriptReview] = await db
    .select()
    .from(schema.scriptReviews)
    .where(eq(schema.scriptReviews.id, id))
    .limit(1);

  if (!scriptReview) {
    return NextResponse.json({ error: "Script review not found" }, { status: 404 });
  }

  return NextResponse.json(scriptReview);
}

const updateScriptReviewSchema = z.object({
  scriptTitle: z.string().min(1).optional(),
  scriptText: z.string().min(1).optional(),
  agencyAwarenessLevel: z.number().int().min(1).max(5).nullable().optional(),
  product: z.string().nullable().optional(),
  targetPersona: z.string().nullable().optional(),
  reviewStatus: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit script reviews" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateScriptReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [updated] = await db
    .update(schema.scriptReviews)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.scriptReviews.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Script review not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "script_review_updated",
    resourceType: "script_review",
    resourceId: updated.id,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete script reviews" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.scriptReviews)
      .where(eq(schema.scriptReviews.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Script review not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "script_review_deleted",
      resourceType: "script_review",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this script review because it is referenced by existing content." },
        { status: 409 }
      );
    }
    throw error;
  }
}
