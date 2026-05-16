import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/brand-intel
export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const [intel] = await db.select().from(schema.brandIntelligence).limit(1);
  return NextResponse.json(intel || null);
}

// PUT /api/brand-intel — update brand intelligence content
export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit brand intelligence" }, { status: 403 });
  }

  const body = await request.json();
  const { rawContent, complianceRules, sections } = body as {
    rawContent?: string | null;
    complianceRules?: string | null;
    sections?: unknown;
  };

  const [existing] = await db.select().from(schema.brandIntelligence).limit(1);

  let result;
  if (existing) {
    [result] = await db
      .update(schema.brandIntelligence)
      .set({
        rawContent: rawContent !== undefined ? rawContent : existing.rawContent,
        complianceRules: complianceRules !== undefined ? complianceRules : existing.complianceRules,
        sections: sections !== undefined ? sections : existing.sections,
        updatedAt: new Date(),
      })
      .where(eq(schema.brandIntelligence.id, existing.id))
      .returning();
  } else {
    [result] = await db
      .insert(schema.brandIntelligence)
      .values({
        rawContent: rawContent ?? null,
        complianceRules: complianceRules ?? null,
        sections: sections ?? null,
      })
      .returning();
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "brand_intel_updated",
    resourceType: "brand_intel",
    resourceId: result.id,
  });

  return NextResponse.json(result);
}
