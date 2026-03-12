import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status) {
    updates.status = body.status;
    if (body.status === "approved") {
      updates.approvedBy = auth.portalUser.id;
      updates.approvedAt = new Date();
    }
  }

  const [updated] = await db
    .update(schema.minedAngles)
    .set(updates)
    .where(eq(schema.minedAngles.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Angle not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
