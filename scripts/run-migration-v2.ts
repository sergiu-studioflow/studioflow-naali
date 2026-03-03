import postgres from "postgres";
import * as fs from "fs";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

async function main() {
  console.log("Running migration-v2.sql...\n");

  const migration = fs.readFileSync("scripts/migration-v2.sql", "utf8");

  // Split by semicolons, filter out comments and empty lines
  const statements = migration
    .split(";")
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false;
      // Remove lines that are only comments
      const lines = s.split("\n").filter(l => !l.trim().startsWith("--") && l.trim());
      return lines.length > 0;
    });

  let ok = 0;
  let err = 0;

  for (const stmt of statements) {
    const preview = stmt.replace(/\n/g, " ").substring(0, 90);
    try {
      await sql.unsafe(stmt);
      console.log(`  OK: ${preview}...`);
      ok++;
    } catch (e: any) {
      // "already a member" is fine for ALTER PUBLICATION
      if (e.message?.includes("already a member")) {
        console.log(`  SKIP (already exists): ${preview}...`);
        ok++;
      } else {
        console.log(`  ERR: ${preview}...`);
        console.log(`       ${e.message}`);
        err++;
      }
    }
  }

  console.log(`\nDone: ${ok} succeeded, ${err} failed`);
  await sql.end();
}

main().catch(async (e) => {
  console.error("Migration failed:", e);
  await sql.end();
  process.exit(1);
});
