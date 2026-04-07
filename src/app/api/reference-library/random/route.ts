import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { toAccessibleUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * GET /api/reference-library/random?industry=beauty
 * Return one random active reference. If no industry param is provided,
 * auto-filters by the brand's allowedIndustries from brand_intelligence.
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;

  const industry = req.nextUrl.searchParams.get("industry");

  const conditions = [eq(schema.referenceAdLibrary.isActive, true)];

  if (industry) {
    conditions.push(eq(schema.referenceAdLibrary.industry, industry));
  } else {
    // Auto-filter by brand's allowed industries
    const [brandIntel] = await db
      .select({ allowedIndustries: sql<string>`allowed_industries` })
      .from(schema.brandIntelligence)
      .limit(1);

    if (brandIntel?.allowedIndustries) {
      try {
        const allowed: string[] = JSON.parse(brandIntel.allowedIndustries);
        if (allowed.length > 0) {
          conditions.push(inArray(schema.referenceAdLibrary.industry, allowed));
        }
      } catch { /* ignore parse errors, show all */ }
    }
  }

  const [ref] = await db
    .select()
    .from(schema.referenceAdLibrary)
    .where(and(...conditions))
    .orderBy(sql`random()`)
    .limit(1);

  if (!ref) {
    return NextResponse.json({ error: "No references found" }, { status: 404 });
  }

  const previewUrl = await toAccessibleUrl(ref.imageUrl);

  return NextResponse.json({ ...ref, previewUrl });
}
