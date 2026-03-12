import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const imports = await db
    .select()
    .from(schema.csvImports)
    .orderBy(desc(schema.csvImports.createdAt));

  return NextResponse.json(imports);
}

// PATCH to finalize an import (set status to complete with final row count)
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const { importId, status, rowCount } = body;

  if (!importId) {
    return NextResponse.json({ error: "importId required" }, { status: 400 });
  }

  await db
    .update(schema.csvImports)
    .set({
      status: status || "complete",
      rowCount: rowCount || 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.csvImports.id, importId));

  // Log activity
  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "csv_imported",
    resourceType: "csv_import",
    resourceId: importId,
    details: { rowCount, status },
  });

  return NextResponse.json({ ok: true });
}
