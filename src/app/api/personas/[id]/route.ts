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

  const [persona] = await db
    .select()
    .from(schema.personas)
    .where(eq(schema.personas.id, id))
    .limit(1);

  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  return NextResponse.json(persona);
}

const updatePersonaSchema = z.object({
  name: z.string().min(1).optional(),
  label: z.string().nullable().optional(),
  demographics: z.string().nullable().optional(),
  situation: z.string().nullable().optional(),
  painPoints: z.string().nullable().optional(),
  whatTheyTried: z.string().nullable().optional(),
  whatTheyWant: z.string().nullable().optional(),
  objections: z.string().nullable().optional(),
  conversionTriggers: z.string().nullable().optional(),
  messagingNotes: z.string().nullable().optional(),
  complianceNote: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit personas" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updatePersonaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [updated] = await db
    .update(schema.personas)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.personas.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "persona_updated",
    resourceType: "persona",
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
    return NextResponse.json({ error: "Viewers cannot delete personas" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.personas)
      .where(eq(schema.personas.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "persona_deleted",
      resourceType: "persona",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this persona because it is referenced by existing content briefs." },
        { status: 409 }
      );
    }
    throw error;
  }
}
