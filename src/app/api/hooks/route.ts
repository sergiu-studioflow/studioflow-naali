import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const hooks = await db
    .select({
      id: schema.hookVariations.id,
      scriptId: schema.hookVariations.scriptId,
      hookTitle: schema.hookVariations.hookTitle,
      hookType: schema.hookVariations.hookType,
      hookText: schema.hookVariations.hookText,
      visualDescription: schema.hookVariations.visualDescription,
      whyItWorks: schema.hookVariations.whyItWorks,
      platformBestFit: schema.hookVariations.platformBestFit,
      estimatedStopRate: schema.hookVariations.estimatedStopRate,
      sortOrder: schema.hookVariations.sortOrder,
      createdAt: schema.hookVariations.createdAt,
      scriptTitle: schema.generatedScripts.scriptTitle,
    })
    .from(schema.hookVariations)
    .leftJoin(
      schema.generatedScripts,
      eq(schema.hookVariations.scriptId, schema.generatedScripts.id)
    )
    .orderBy(desc(schema.hookVariations.createdAt), asc(schema.hookVariations.sortOrder));

  return NextResponse.json(hooks);
}
