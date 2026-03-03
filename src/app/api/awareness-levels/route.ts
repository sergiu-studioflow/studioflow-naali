import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const levels = await db
    .select()
    .from(schema.awarenessLevels)
    .orderBy(asc(schema.awarenessLevels.level));

  return NextResponse.json(levels);
}

const createLevelSchema = z.object({
  level: z.number().int().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  scriptObjective: z.string().optional(),
  hookStyle: z.string().optional(),
  creativeGuidelines: z.string().optional(),
  examples: z.string().optional(),
  tone: z.string().optional(),
  warning: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create awareness levels" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createLevelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  try {
    const [level] = await db
      .insert(schema.awarenessLevels)
      .values(parsed.data)
      .returning();

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "awareness_level_created",
      resourceType: "awareness_level",
      resourceId: level.id,
    });

    return NextResponse.json(level, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: `Level ${parsed.data.level} already exists. Each awareness level must have a unique number.` },
        { status: 409 }
      );
    }
    throw error;
  }
}
