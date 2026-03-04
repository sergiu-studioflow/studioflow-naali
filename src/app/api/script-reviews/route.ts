import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const scriptReviews = await db
    .select()
    .from(schema.scriptReviews)
    .orderBy(desc(schema.scriptReviews.createdAt));

  return NextResponse.json(scriptReviews);
}

const createScriptReviewSchema = z.object({
  scriptTitle: z.string().min(1),
  scriptText: z.string().min(1),
  agencyAwarenessLevel: z.number().int().min(1).max(5).optional(),
  product: z.string().optional(),
  targetPersona: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create script reviews" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createScriptReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [scriptReview] = await db
    .insert(schema.scriptReviews)
    .values({
      ...parsed.data,
      sourceType: "manual",
      reviewStatus: "pending",
      submittedBy: auth.portalUser.id,
    })
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "script_review_created",
    resourceType: "script_review",
    resourceId: scriptReview.id,
  });

  return NextResponse.json(scriptReview, { status: 201 });
}
