import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const motivators = await db
    .select()
    .from(schema.motivators)
    .orderBy(asc(schema.motivators.sortOrder));

  return NextResponse.json(motivators);
}

const createMotivatorSchema = z.object({
  code: z.string().min(1),
  mainAngle: z.string().min(1),
  mainAngleEstimatedShare: z.string().optional(),
  mainAngleDescription: z.string().optional(),
  subAngle: z.string().min(1),
  painPointRelief: z.string().optional(),
  coreMotivation: z.string().optional(),
  typicalTriggers: z.string().optional(),
  representativeQuotes: z.string().optional(),
  emotionalTone: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create motivators" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createMotivatorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [motivator] = await db
    .insert(schema.motivators)
    .values(parsed.data)
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "motivator_created",
    resourceType: "motivator",
    resourceId: motivator.id,
  });

  return NextResponse.json(motivator, { status: 201 });
}
