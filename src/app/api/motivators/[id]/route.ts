import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const [motivator] = await db
    .select()
    .from(schema.motivators)
    .where(eq(schema.motivators.id, id))
    .limit(1);

  if (!motivator) {
    return NextResponse.json({ error: "Motivator not found" }, { status: 404 });
  }

  return NextResponse.json(motivator);
}

const updateMotivatorSchema = z.object({
  code: z.string().min(1).optional(),
  mainAngle: z.string().min(1).optional(),
  mainAngleEstimatedShare: z.string().nullable().optional(),
  mainAngleDescription: z.string().nullable().optional(),
  subAngle: z.string().min(1).optional(),
  painPointRelief: z.string().nullable().optional(),
  coreMotivation: z.string().nullable().optional(),
  typicalTriggers: z.string().nullable().optional(),
  representativeQuotes: z.string().nullable().optional(),
  emotionalTone: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit motivators" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateMotivatorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [updated] = await db
    .update(schema.motivators)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.motivators.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Motivator not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "motivator_updated",
    resourceType: "motivator",
    resourceId: updated.id,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete motivators" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.motivators)
      .where(eq(schema.motivators.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Motivator not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "motivator_deleted",
      resourceType: "motivator",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this motivator because it is referenced by existing content." },
        { status: 409 }
      );
    }
    throw error;
  }
}
