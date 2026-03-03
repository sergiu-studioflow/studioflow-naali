import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const scripts = await db
    .select()
    .from(schema.generatedScripts)
    .orderBy(desc(schema.generatedScripts.createdAt));

  return NextResponse.json(scripts);
}
