import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const importSchema = z.object({
  fileName: z.string().min(1),
  sourceType: z.enum(["asg_survey", "mag_survey", "menopause_survey", "reorder_survey"]),
  rows: z.array(z.record(z.string(), z.unknown())).min(1),
  importId: z.string().uuid().optional(), // For batch continuation
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body too large or malformed JSON" },
      { status: 400 }
    );
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return NextResponse.json(
      { error: `Validation failed: ${issues.join("; ")}` },
      { status: 400 }
    );
  }

  const { fileName, sourceType, rows, importId: existingImportId } = parsed.data;

  try {
    let importId = existingImportId;

    // Create import record if this is the first batch
    if (!importId) {
      const [importRecord] = await db
        .insert(schema.csvImports)
        .values({
          uploadedBy: auth.portalUser.id,
          fileName,
          sourceType,
          rowCount: 0,
          status: "processing",
        })
        .returning();
      importId = importRecord.id;
    }

    // Batch insert reviews
    const reviewValues = rows.map((row) => ({
      importId,
      sourceType,
      productContext: (row.productContext as string) || null,
      customerName: (row.customerName as string) || null,
      customerEmail: (row.customerEmail as string) || null,
      totalSpent: (row.totalSpent as string) || null,
      ordersCount: (row.ordersCount as number) || null,
      mainProblem: (row.mainProblem as string) || null,
      problemDescription: (row.problemDescription as string) || null,
      dailyImpact: (row.dailyImpact as string) || null,
      moodWords: (row.moodWords as string) || null,
      purchaseHesitations: (row.purchaseHesitations as string) || null,
      whatConvinced: (row.whatConvinced as string) || null,
      whyPurchased: (row.whyPurchased as string) || null,
      expectedOutcome: (row.expectedOutcome as string) || null,
      reviewText: (row.reviewText as string) || null,
      symptoms: (row.symptoms as string[]) || null,
      discoverySource: (row.discoverySource as string) || null,
      influencerSource: (row.influencerSource as string) || null,
      utmSource: (row.utmSource as string) || null,
      rawData: (row.rawData as Record<string, unknown>) || null,
      submittedAt: (row.submittedAt as string) || null,
    }));

    if (reviewValues.length > 0) {
      await db.insert(schema.customerReviews).values(reviewValues);
    }

    return NextResponse.json({
      importId,
      rowsInserted: reviewValues.length,
    });
  } catch (err) {
    console.error("Import error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to import rows: ${message}` },
      { status: 500 }
    );
  }
}
