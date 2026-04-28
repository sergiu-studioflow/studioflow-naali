import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    "https://studioflow-naali.vercel.app",
    "https://naali.studio-flow.co",
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
    minPasswordLength: 8,
  },
});

// =============================================
// requireAuth — use in all protected API routes
// =============================================

export type PortalUser = {
  id: string;
  userId: string;
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let [portalUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.userId, session.user.id))
    .limit(1);

  // Auto-provision any verified Magic Link user as admin on first login
  if (!portalUser) {
    const [created] = await db
      .insert(schema.users)
      .values({
        userId: session.user.id,
        displayName: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        role: "admin",
        isActive: true,
      })
      .returning();
    portalUser = created;
  }

  if (!portalUser || !portalUser.isActive) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return {
    user: { id: session.user.id, email: session.user.email },
    portalUser,
  };
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
