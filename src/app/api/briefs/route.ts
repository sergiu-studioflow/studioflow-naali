import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

// GET /api/briefs — list all briefs
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const status = request.nextUrl.searchParams.get("status");

  let query = db.select().from(schema.contentBriefs).orderBy(desc(schema.contentBriefs.createdAt));

  if (status) {
    const briefs = await db
      .select()
      .from(schema.contentBriefs)
      .where(eq(schema.contentBriefs.status, status))
      .orderBy(desc(schema.contentBriefs.createdAt));
    return NextResponse.json(briefs);
  }

  const briefs = await query;
  return NextResponse.json(briefs);
}

// POST /api/briefs — create new brief
const createBriefSchema = z.object({
  briefName: z.string().min(1),
  contentType: z.string().optional(),
  scenarioDescription: z.string().optional(),
  targetObjection: z.string().optional(),
  angleDirection: z.string().optional(),
  proofAssets: z.array(z.string()).optional(),
  personaId: z.string().uuid().optional(),
  awarenessLevelId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  platform: z.string().optional(),
  duration: z.string().optional(),
  language: z.string().optional(),
  toneOverride: z.string().optional(),
  notes: z.string().optional(),
  motivator: z.string().optional(),
  winnerIds: z.array(z.string().uuid()).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = createBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [brief] = await db
    .insert(schema.contentBriefs)
    .values({
      ...parsed.data,
      createdBy: auth.portalUser.id,
      proofAssets: parsed.data.proofAssets || null,
      winnerIds: parsed.data.winnerIds || null,
    })
    .returning();

  return NextResponse.json(brief, { status: 201 });
}
