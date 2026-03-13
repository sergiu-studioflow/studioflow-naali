import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, and, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

// DELETE /api/feedback/angles — bulk delete angles
const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = bulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const deleted = await db
    .delete(schema.minedAngles)
    .where(inArray(schema.minedAngles.id, parsed.data.ids))
    .returning({ id: schema.minedAngles.id });

  return NextResponse.json({ deleted: deleted.length });
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const miningRunId = searchParams.get("miningRunId");
  const targetPersona = searchParams.get("targetPersona");
  const status = searchParams.get("status");

  const conditions = [];
  if (miningRunId) conditions.push(eq(schema.minedAngles.miningRunId, miningRunId));
  if (targetPersona) conditions.push(eq(schema.minedAngles.targetPersona, targetPersona));
  if (status) conditions.push(eq(schema.minedAngles.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const angles = await db
    .select()
    .from(schema.minedAngles)
    .where(where)
    .orderBy(desc(schema.minedAngles.createdAt));

  // Get unique mining run IDs for the filter dropdown
  const runs = await db
    .selectDistinct({ miningRunId: schema.minedAngles.miningRunId })
    .from(schema.minedAngles)
    .orderBy(desc(schema.minedAngles.miningRunId));

  return NextResponse.json({ angles, runs: runs.map((r) => r.miningRunId) });
}
