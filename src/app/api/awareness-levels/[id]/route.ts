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

  const [level] = await db
    .select()
    .from(schema.awarenessLevels)
    .where(eq(schema.awarenessLevels.id, id))
    .limit(1);

  if (!level) {
    return NextResponse.json({ error: "Awareness level not found" }, { status: 404 });
  }

  return NextResponse.json(level);
}

const updateLevelSchema = z.object({
  level: z.number().int().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  scriptObjective: z.string().nullable().optional(),
  hookStyle: z.string().nullable().optional(),
  creativeGuidelines: z.string().nullable().optional(),
  examples: z.string().nullable().optional(),
  tone: z.string().nullable().optional(),
  warning: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit awareness levels" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateLevelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  try {
    const [updated] = await db
      .update(schema.awarenessLevels)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.awarenessLevels.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Awareness level not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "awareness_level_updated",
      resourceType: "awareness_level",
      resourceId: updated.id,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "That level number is already taken. Each awareness level must have a unique number." },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete awareness levels" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.awarenessLevels)
      .where(eq(schema.awarenessLevels.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Awareness level not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "awareness_level_deleted",
      resourceType: "awareness_level",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this awareness level because it is referenced by existing content briefs." },
        { status: 409 }
      );
    }
    throw error;
  }
}
