import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const levels = await db
    .select()
    .from(schema.awarenessLevels)
    .orderBy(asc(schema.awarenessLevels.level));

  return NextResponse.json(levels);
}
