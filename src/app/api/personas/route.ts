import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const personas = await db
    .select()
    .from(schema.personas)
    .orderBy(asc(schema.personas.sortOrder));

  return NextResponse.json(personas);
}

const createPersonaSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  demographics: z.string().optional(),
  situation: z.string().optional(),
  painPoints: z.string().optional(),
  whatTheyTried: z.string().optional(),
  whatTheyWant: z.string().optional(),
  objections: z.string().optional(),
  conversionTriggers: z.string().optional(),
  messagingNotes: z.string().optional(),
  complianceNote: z.string().optional(),
  estimatedShare: z.string().optional(),
  dominantAngles: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create personas" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPersonaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [persona] = await db
    .insert(schema.personas)
    .values(parsed.data)
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "persona_created",
    resourceType: "persona",
    resourceId: persona.id,
  });

  return NextResponse.json(persona, { status: 201 });
}
