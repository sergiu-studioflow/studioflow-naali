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

// =============================================
// Email allowlist for self-service access
// =============================================
// Configure via env (either or both):
//   ALLOWED_EMAILS        = "alice@brand.com,bob@brand.com"   (exact, case-insensitive)
//   ALLOWED_EMAIL_DOMAINS = "brand.com,studio-flow.co"        (domain, case-insensitive)
// If BOTH are unset, no NEW email can self-provision — only people who already
// have a portal user row can sign in (fail-closed; existing team unaffected).

function parseEnvList(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  const e = (email || "").trim().toLowerCase();
  if (!e || !e.includes("@")) return false;
  if (parseEnvList(process.env.ALLOWED_EMAILS).includes(e)) return true;
  const domain = e.split("@")[1] || "";
  return !!domain && parseEnvList(process.env.ALLOWED_EMAIL_DOMAINS).includes(domain);
}

async function portalUserExists(email: string): Promise<boolean> {
  const e = (email || "").trim().toLowerCase();
  if (!e) return false;
  try {
    const [row] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, e))
      .limit(1);
    return !!row;
  } catch {
    return false;
  }
}

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

  // Provision a portal user on first login ONLY for allow-listed emails. This
  // closes the open-registration hole: a verified Better Auth user whose email
  // is not on the allowlist gets no portal access (and never an admin grant).
  // Existing users (already have a row) are unaffected.
  if (!portalUser) {
    const email = session.user.email || "";
    if (!isEmailAllowed(email)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const [created] = await db
      .insert(schema.users)
      .values({
        userId: session.user.id,
        displayName: session.user.name || email.split("@")[0] || "User",
        email,
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
