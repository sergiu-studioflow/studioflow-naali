import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot delete video briefs" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(schema.generatedVideoBriefs)
      .where(eq(schema.generatedVideoBriefs.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Video brief not found" }, { status: 404 });
    }

    await db.insert(schema.activityLog).values({
      userId: auth.portalUser.id,
      action: "video_brief_deleted",
      resourceType: "video_brief",
      resourceId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return NextResponse.json(
        { error: "Cannot delete this video brief because it is referenced by existing content." },
        { status: 409 }
      );
    }
    throw error;
  }
}
