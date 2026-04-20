import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { downloadFromR2 } from "@/lib/r2";

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

  let items: Record<string, unknown>[] = [];
  try {
    const { buffer } = await downloadFromR2("shared/reference-ad-library/manifest.json");
    const manifest = JSON.parse(buffer.toString("utf-8"));
    items = (manifest.items || []).filter((item: Record<string, unknown>) => item.isActive !== false);
  } catch {
    return NextResponse.json({ error: "No references found" }, { status: 404 });
  }

  if (industry) {
    items = items.filter((item) => item.industry === industry);
  } else {
    const [brandIntel] = await db
      .select({ allowedIndustries: sql<string>`allowed_industries` })
      .from(schema.brandIntelligence)
      .limit(1);

    if (brandIntel?.allowedIndustries) {
      try {
        const allowed: string[] = JSON.parse(brandIntel.allowedIndustries);
        if (allowed.length > 0) {
          items = items.filter((item) => allowed.includes(item.industry as string));
        }
      } catch { /* show all */ }
    }
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "No references found" }, { status: 404 });
  }

  const ref = items[Math.floor(Math.random() * items.length)];
  return NextResponse.json({ ...ref, previewUrl: ref.imageUrl });
}
