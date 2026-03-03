import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const personas = await db
    .select()
    .from(schema.personas)
    .orderBy(asc(schema.personas.sortOrder));

  return NextResponse.json(personas);
}
