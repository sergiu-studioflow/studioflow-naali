import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/briefs/:id
 * Fetch a single brief with full data.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const [brief] = await db
    .select()
    .from(schema.generatedBriefs)
    .where(eq(schema.generatedBriefs.id, id))
    .limit(1);

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  return NextResponse.json(brief);
}

/**
 * DELETE /api/briefs/:id
 * Delete a brief.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete briefs" }, { status: 403 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(schema.generatedBriefs)
    .where(eq(schema.generatedBriefs.id, id))
    .returning({ id: schema.generatedBriefs.id });

  if (!deleted) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, id: deleted.id });
}
