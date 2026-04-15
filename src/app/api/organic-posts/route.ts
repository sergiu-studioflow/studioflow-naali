import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/organic-posts?profile_id=X
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const profileIdStr = request.nextUrl.searchParams.get("profile_id");
  if (!profileIdStr) {
    return NextResponse.json({ error: "profile_id param required" }, { status: 400 });
  }

  const profileId = parseInt(profileIdStr, 10);
  if (isNaN(profileId)) {
    return NextResponse.json({ error: "Invalid profile_id" }, { status: 400 });
  }

  const posts = await db
    .select()
    .from(schema.organicPosts)
    .where(eq(schema.organicPosts.profileRef, profileId))
    .orderBy(desc(schema.organicPosts.publishDate));

  return NextResponse.json({ posts });
}
