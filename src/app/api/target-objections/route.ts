import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const targetObjections = await db
    .select()
    .from(schema.targetObjections)
    .orderBy(asc(schema.targetObjections.sortOrder));

  return NextResponse.json(targetObjections);
}

const createTargetObjectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create target objections" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTargetObjectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [targetObjection] = await db
    .insert(schema.targetObjections)
    .values(parsed.data)
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "target_objection_created",
    resourceType: "target_objection",
    resourceId: targetObjection.id,
  });

  return NextResponse.json(targetObjection, { status: 201 });
}
