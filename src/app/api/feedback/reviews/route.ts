import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq, ilike, or, sql, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const sourceType = searchParams.get("sourceType");
  const productContext = searchParams.get("productContext");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];
  if (sourceType) {
    conditions.push(eq(schema.customerReviews.sourceType, sourceType));
  }
  if (productContext) {
    conditions.push(eq(schema.customerReviews.productContext, productContext));
  }
  if (search) {
    conditions.push(
      or(
        ilike(schema.customerReviews.reviewText, `%${search}%`),
        ilike(schema.customerReviews.mainProblem, `%${search}%`),
        ilike(schema.customerReviews.problemDescription, `%${search}%`),
        ilike(schema.customerReviews.whyPurchased, `%${search}%`),
        ilike(schema.customerReviews.customerName, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [reviews, countResult] = await Promise.all([
    db
      .select({
        id: schema.customerReviews.id,
        sourceType: schema.customerReviews.sourceType,
        productContext: schema.customerReviews.productContext,
        customerName: schema.customerReviews.customerName,
        totalSpent: schema.customerReviews.totalSpent,
        ordersCount: schema.customerReviews.ordersCount,
        mainProblem: schema.customerReviews.mainProblem,
        reviewText: schema.customerReviews.reviewText,
        whyPurchased: schema.customerReviews.whyPurchased,
        whatConvinced: schema.customerReviews.whatConvinced,
        dailyImpact: schema.customerReviews.dailyImpact,
        submittedAt: schema.customerReviews.submittedAt,
        createdAt: schema.customerReviews.createdAt,
      })
      .from(schema.customerReviews)
      .where(where)
      .orderBy(desc(schema.customerReviews.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.customerReviews)
      .where(where),
  ]);

  return NextResponse.json({
    reviews,
    total: countResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
  });
}
