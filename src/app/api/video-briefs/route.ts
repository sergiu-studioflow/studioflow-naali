import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

// GET /api/video-briefs — list all video brief requests
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const status = request.nextUrl.searchParams.get("status");

  if (status) {
    const briefs = await db
      .select()
      .from(schema.videoBriefRequests)
      .where(eq(schema.videoBriefRequests.status, status))
      .orderBy(desc(schema.videoBriefRequests.createdAt));
    return NextResponse.json(briefs);
  }

  const briefs = await db
    .select()
    .from(schema.videoBriefRequests)
    .orderBy(desc(schema.videoBriefRequests.createdAt));
  return NextResponse.json(briefs);
}

// POST /api/video-briefs — create new video brief request
const createVideoBriefSchema = z.object({
  briefName: z.string().min(1),
  contentType: z.string().optional(),
  scenarioDescription: z.string().optional(),
  targetObjection: z.string().optional(),
  angleDirection: z.string().optional(),
  persona: z.string().optional(),
  awarenessLevel: z.string().optional(),
  platform: z.string().optional(),
  duration: z.string().optional(),
  language: z.string().optional(),
  productionConstraints: z.string().optional(),
  proofAssets: z.array(z.string()).optional(),
  notes: z.string().optional(),
  motivator: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = createVideoBriefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [brief] = await db
    .insert(schema.videoBriefRequests)
    .values({
      ...parsed.data,
      proofAssets: parsed.data.proofAssets || null,
    })
    .returning();

  return NextResponse.json(brief, { status: 201 });
}
