import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
