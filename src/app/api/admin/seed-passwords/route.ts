// One-off admin endpoint for seeding initial password credentials.
// Will be removed in a follow-up commit. Protected by ADMIN_SETUP_SECRET.

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SEEDS = [
  "sergiu@studio-flow.co",
  "k.boucenna@naali.fr",
];

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  let pw = "";
  for (const b of bytes) pw += alphabet[b % alphabet.length];
  return pw;
}

function newId() {
  return randomBytes(16).toString("hex").slice(0, 24);
}

export async function POST(req: NextRequest) {
  const expected = process.env.BETTER_AUTH_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Endpoint disabled" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{ email: string; password: string }> = [];
  for (const email of SEEDS) {
    const rows = (await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${email} LIMIT 1`
    )) as unknown as Array<{ id: string }>;
    if (rows.length === 0) {
      results.push({ email, password: "(skipped — no user row)" });
      continue;
    }
    const userId = rows[0].id;
    const password = generatePassword();
    const hash = await hashPassword(password);

    await db.execute(
      sql`DELETE FROM account WHERE user_id = ${userId} AND provider_id = 'credential'`
    );
    await db.execute(
      sql`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
          VALUES (${newId()}, ${userId}, 'credential', ${userId}, ${hash}, NOW(), NOW())`
    );
    results.push({ email, password });
  }

  return NextResponse.json({ ok: true, results });
}
