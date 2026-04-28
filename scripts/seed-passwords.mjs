// One-off: hash passwords with Better Auth's scrypt and upsert into the
// `account` table for the two seed users. Run once, then delete.
//
// Usage: node scripts/seed-passwords.mjs
//
// Reads DATABASE_URL from .env.local. Generates strong random passwords
// (or accepts SEED_ADMIN_PASSWORD / SEED_NAALI_PASSWORD env vars).

import { hashPassword } from "better-auth/crypto";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cheap .env.local loader — avoids dotenv as a runtime dep
const envPath = resolve(__dirname, "..", ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
  if (m && !process.env[m[1]]) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const SEEDS = [
  { email: "sergiu@studio-flow.co", envVar: "SEED_ADMIN_PASSWORD" },
  { email: "k.boucenna@naali.fr", envVar: "SEED_NAALI_PASSWORD" },
];

function generatePassword() {
  // 16 chars from a URL-safe alphabet — strong, easy to type once
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  let pw = "";
  for (const b of bytes) pw += alphabet[b % alphabet.length];
  return pw;
}

function newId() {
  // Better Auth uses cuid-ish ids; a 24-char base36 string is fine for FK
  return randomBytes(16).toString("hex").slice(0, 24);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const out = [];
    for (const seed of SEEDS) {
      const { rows } = await pool.query(
        `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
        [seed.email]
      );
      if (rows.length === 0) {
        console.error(`skip: no user row for ${seed.email}`);
        continue;
      }
      const userId = rows[0].id;
      const password = process.env[seed.envVar] || generatePassword();
      const hash = await hashPassword(password);

      // Remove any stale credential row first, then insert fresh
      await pool.query(
        `DELETE FROM account WHERE user_id = $1 AND provider_id = 'credential'`,
        [userId]
      );
      await pool.query(
        `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())`,
        [newId(), userId, userId, hash]
      );
      out.push({ email: seed.email, password });
    }

    console.log("\n=== Credentials seeded ===");
    for (const r of out) {
      console.log(`${r.email}\n  password: ${r.password}\n`);
    }
    console.log("Both users can change their password from /settings after first login.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
