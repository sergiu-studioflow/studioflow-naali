import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const scripts = await db
    .select()
    .from(schema.generatedScripts)
    .orderBy(desc(schema.generatedScripts.createdAt));

  const hooks = await db
    .select()
    .from(schema.hookVariations)
    .orderBy(asc(schema.hookVariations.sortOrder));

  const hooksByScript = new Map<string, (typeof hooks)[number][]>();
  for (const hook of hooks) {
    const arr = hooksByScript.get(hook.scriptId) || [];
    arr.push(hook);
    hooksByScript.set(hook.scriptId, arr);
  }

  const result = scripts.map((s) => ({
    ...s,
    hookVariations: hooksByScript.get(s.id) || [],
  }));

  return NextResponse.json(result);
}
