import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/briefs/[id] — get brief detail with script + hooks
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const [brief] = await db
    .select()
    .from(schema.contentBriefs)
    .where(eq(schema.contentBriefs.id, id))
    .limit(1);

  if (!brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // If complete, fetch generated script + hooks
  let script = null;
  let hooks: typeof schema.hookVariations.$inferSelect[] = [];

  if (brief.status === "complete") {
    const [s] = await db
      .select()
      .from(schema.generatedScripts)
      .where(eq(schema.generatedScripts.briefId, id))
      .limit(1);

    if (s) {
      script = s;
      hooks = await db
        .select()
        .from(schema.hookVariations)
        .where(eq(schema.hookVariations.scriptId, s.id));
    }
  }

  return NextResponse.json({ brief, script, hooks });
}

// PATCH /api/briefs/[id] — update brief (only if status is "new")
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(schema.contentBriefs)
    .where(eq(schema.contentBriefs.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  if (existing.status !== "new") {
    return NextResponse.json({ error: "Cannot edit a brief that has been triggered" }, { status: 400 });
  }

  const body = await request.json();
  const [updated] = await db
    .update(schema.contentBriefs)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schema.contentBriefs.id, id))
    .returning();

  return NextResponse.json(updated);
}
