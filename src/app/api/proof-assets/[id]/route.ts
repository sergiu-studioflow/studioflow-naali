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

  const [proofAsset] = await db
    .select()
    .from(schema.proofAssets)
    .where(eq(schema.proofAssets.id, id))
    .limit(1);

  if (!proofAsset) {
    return NextResponse.json({ error: "Proof asset not found" }, { status: 404 });
  }

  return NextResponse.json(proofAsset);
}

const updateProofAssetSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit proof assets" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateProofAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [updated] = await db
    .update(schema.proofAssets)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.proofAssets.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Proof asset not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "proof_asset_updated",
    resourceType: "proof_asset",
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
    return NextResponse.json({ error: "Viewers cannot delete proof assets" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.proofAssets)
      .where(eq(schema.proofAssets.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Proof asset not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "proof_asset_deleted",
      resourceType: "proof_asset",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this proof asset because it is referenced by existing content." },
        { status: 409 }
      );
    }
    throw error;
  }
}
