import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { magicLink } from "better-auth/plugins";
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

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "StudioFlow <onboarding@resend.dev>",
          to: email,
          subject: "Your magic link to sign in",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
              <p style="font-size: 15px; color: #111; margin-bottom: 24px;">
                Click the button below to sign in to your Naali Creative Studio portal.
                This link expires in 24 hours.
              </p>
              <a href="${url}" style="display: inline-block; background: #2D5A3D; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                Sign in to Naali Portal
              </a>
              <p style="margin-top: 24px; font-size: 13px; color: #666;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
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

  const [portalUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.userId, session.user.id))
    .limit(1);

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
