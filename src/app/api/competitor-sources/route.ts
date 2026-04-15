import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq, inArray, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function extractPageId(url: string): string | null {
  try {
    return new URL(url).searchParams.get("view_all_page_id");
  } catch {
    return null;
  }
}

// GET /api/competitor-sources
export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const rows = await db
    .select()
    .from(schema.competitorSources)
    .orderBy(asc(schema.competitorSources.name));

  return NextResponse.json(rows);
}

// POST /api/competitor-sources — create
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot add competitors" }, { status: 403 });
  }

  const { name, metaLibraryUrl, country } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Competitor name is required" }, { status: 400 });
  }
  if (!metaLibraryUrl?.trim()) {
    return NextResponse.json({ error: "Meta Ad Library URL is required" }, { status: 400 });
  }

  const competitorPageId = extractPageId(metaLibraryUrl);
  if (!competitorPageId) {
    return NextResponse.json(
      { error: "Invalid URL — must contain a view_all_page_id parameter" },
      { status: 400 }
    );
  }

  const [record] = await db
    .insert(schema.competitorSources)
    .values({
      name: name.trim(),
      metaLibraryUrl: metaLibraryUrl.trim(),
      competitorPageId,
      country: country || "GB",
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}

// PATCH /api/competitor-sources — update
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot edit competitors" }, { status: 403 });
  }

  const body = await request.json();
  const { id, name, metaLibraryUrl, country, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name.trim();
  if (country !== undefined) updates.country = country;
  if (isActive !== undefined) updates.isActive = isActive;

  if (metaLibraryUrl !== undefined) {
    const pageId = extractPageId(metaLibraryUrl);
    if (!pageId) {
      return NextResponse.json(
        { error: "Invalid URL — must contain a view_all_page_id parameter" },
        { status: 400 }
      );
    }
    updates.metaLibraryUrl = metaLibraryUrl.trim();
    updates.competitorPageId = pageId;
  }

  const [updated] = await db
    .update(schema.competitorSources)
    .set(updates)
    .where(eq(schema.competitorSources.id, id))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/competitor-sources — bulk delete
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete competitors" }, { status: 403 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  await db.delete(schema.competitorSources).where(inArray(schema.competitorSources.id, ids));
  return NextResponse.json({ success: true });
}
