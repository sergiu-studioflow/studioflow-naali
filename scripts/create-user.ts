import postgres from "postgres";
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "crypto";
import "dotenv/config";

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.error("Usage: tsx scripts/create-user.ts <email> <password>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
const id = () => randomBytes(24).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 32);

async function main() {
  const existing = await sql`SELECT id FROM "user" WHERE email = ${EMAIL} LIMIT 1`;
  if (existing.length > 0) {
    console.error(`User ${EMAIL} already exists (id=${existing[0].id})`);
    process.exit(1);
  }

  const userId = id();
  const accountId = id();
  const hash = await hashPassword(PASSWORD);
  const now = new Date();

  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
      VALUES (${userId}, ${EMAIL.split("@")[0]}, ${EMAIL}, true, ${now}, ${now})
    `;
    await tx`
      INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${accountId}, ${EMAIL}, 'credential', ${userId}, ${hash}, ${now}, ${now})
    `;
  });

  console.log(`Created user ${EMAIL} (id=${userId})`);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
