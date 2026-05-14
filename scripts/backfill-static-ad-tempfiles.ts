/**
 * One-shot backfill: re-upload Kie tempfile URLs to R2 and update DB rows.
 *
 * Usage:
 *   npx vercel env pull /tmp/env --environment=production --yes
 *   npx tsx -r dotenv/config scripts/backfill-static-ad-tempfiles.ts dotenv_config_path=/tmp/env
 *
 * Walks static_ad_generations rows where status='completed' and image_url is
 * not on R2 / studio-flow.co, downloads from the tempfile (Kie URLs live
 * ~24h), uploads to canonical R2 key, updates the row. Idempotent.
 *
 * Single-brand variant: uses brands/<BRAND_SLUG>/... as the R2 prefix.
 */
import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { uploadToR2 } from "../src/lib/r2";
import { BRAND_SLUG } from "../src/lib/static-ads/config";

async function main() {
  const orphans = await db
    .select()
    .from(schema.staticAdGenerations)
    .where(
      and(
        eq(schema.staticAdGenerations.status, "completed"),
        sql`${schema.staticAdGenerations.imageUrl} NOT LIKE '%r2.dev%'`,
        sql`${schema.staticAdGenerations.imageUrl} NOT LIKE '%r2.cloudflarestorage.com%'`,
        sql`${schema.staticAdGenerations.imageUrl} NOT LIKE '%studio-flow.co%'`,
        sql`${schema.staticAdGenerations.imageUrl} IS NOT NULL`
      )
    );

  console.log(`Found ${orphans.length} orphaned rows`);

  let ok = 0;
  let failed = 0;
  for (const row of orphans) {
    if (!row.imageUrl) continue;
    try {
      const res = await fetch(row.imageUrl);
      if (!res.ok) {
        console.warn(`  [${row.id}] source fetch ${res.status} — likely expired`);
        failed++;
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const ct = res.headers.get("content-type") || "image/png";
      const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : "png";

      const key = `brands/${BRAND_SLUG}/static-ad-system/generated-ads/${row.id}.${ext}`;

      const r2Url = await uploadToR2(key, buf, ct);
      await db
        .update(schema.staticAdGenerations)
        .set({ imageUrl: r2Url, updatedAt: new Date() })
        .where(eq(schema.staticAdGenerations.id, row.id));
      console.log(`  [${row.id}] -> ${key}`);
      ok++;
    } catch (err) {
      console.error(`  [${row.id}] failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\nDone: ${ok} migrated, ${failed} failed`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
