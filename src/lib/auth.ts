import { createClient } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type PortalUser = {
  id: string;
  authUserId: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type AuthResult = {
  user: { id: string; email?: string };
  portalUser: PortalUser;
};

export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [portalUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.authUserId, user.id))
    .limit(1);

  if (!portalUser || !portalUser.isActive) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return { user, portalUser };
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
