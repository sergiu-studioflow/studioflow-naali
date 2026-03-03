import postgres from "postgres";
import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL not set. Use: DOTENV_CONFIG_PATH=.env.local npx tsx scripts/migrate-phase2.ts"
  );
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

// =============================================
// HELPER: Extract awareness level number from "2 - Problem Aware" -> 2
// =============================================
function extractAwarenessLevel(raw: string | null): number | null {
  if (!raw) return null;
  const match = raw.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// =============================================
// LOAD DATA FILES
// =============================================

const brandIntelContent = readFileSync(
  join(__dirname, "data", "brand-intelligence-content.txt"),
  "utf-8"
);

const scriptReviews: any[] = JSON.parse(
  readFileSync(join(__dirname, "data", "script-reviews.json"), "utf-8")
);

// =============================================
// MAIN MIGRATION
// =============================================

async function main() {
  console.log("=".repeat(50));
  console.log("Phase 2 Migration: Airtable -> Supabase");
  console.log("=".repeat(50));
  console.log("");

  // -----------------------------------------------
  // STEP 1: Brand Intelligence (1 record)
  // -----------------------------------------------
  console.log("Step 1: Updating brand intelligence with full content...");

  const existingBI =
    await sql`SELECT id FROM brand_intelligence WHERE title LIKE '%Brand Intelligence%' LIMIT 1`;

  if (existingBI.length > 0) {
    await sql`
      UPDATE brand_intelligence
      SET raw_content = ${brandIntelContent},
          title = ${"Naali - Brand Intelligence"},
          airtable_record_id = ${"recOtdAm8GnitOKER"},
          updated_at = ${"2026-02-24T00:00:00.000Z"}
      WHERE id = ${existingBI[0].id}
    `;
    console.log("  Updated existing brand intelligence with full content");
  } else {
    await sql`
      INSERT INTO brand_intelligence (title, raw_content, sections, airtable_record_id, updated_at)
      VALUES (
        ${"Naali - Brand Intelligence"},
        ${brandIntelContent},
        ${null},
        ${"recOtdAm8GnitOKER"},
        ${"2026-02-24T00:00:00.000Z"}
      )
    `;
    console.log("  Inserted new brand intelligence record");
  }
  console.log(`  Content length: ${brandIntelContent.length} characters\n`);

  // -----------------------------------------------
  // STEP 2: Generated Scripts (2 records)
  // -----------------------------------------------
  console.log("Step 2: Inserting generated scripts (2 records)...");

  // Look up brief IDs from Phase 1
  const [briefKarim] =
    await sql`SELECT id FROM content_briefs WHERE airtable_record_id = ${"recVITNMG7rysPGHA"}`;
  const [briefMarie] =
    await sql`SELECT id FROM content_briefs WHERE airtable_record_id = ${"recDy8fNWsPhJM7x1"}`;

  if (!briefKarim) console.error("  WARN: Content brief recVITNMG7rysPGHA not found");
  if (!briefMarie) console.error("  WARN: Content brief recDy8fNWsPhJM7x1 not found");

  // Load script data from JSON files
  const generatedScripts: any[] = JSON.parse(
    readFileSync(join(__dirname, "data", "generated-scripts.json"), "utf-8")
  );

  for (const s of generatedScripts) {
    // Determine the brief_id based on airtable_record_id mapping
    let briefId: string | null = null;
    if (s.airtable_record_id === "recmbQWI6EbHD5YdY") {
      briefId = briefKarim?.id || null; // Nathalie script -> Test karim brief
    } else if (s.airtable_record_id === "recsYmv2Rh9yFsANo") {
      briefId = briefMarie?.id || null; // Marie script -> Marie UGC 30s brief
    }

    await sql`
      INSERT INTO generated_scripts (
        brief_id, script_title, content_type, full_script, thinking_sequence,
        dialogue, scene_breakdown, visual_direction, audio_direction,
        on_screen_text, emotional_arc, compliance_review, medical_context_used,
        platform, duration, review_status, airtable_record_id, created_at
      ) VALUES (
        ${briefId},
        ${s.script_title},
        ${s.content_type},
        ${s.full_script},
        ${s.thinking_sequence},
        ${s.dialogue},
        ${s.scene_breakdown},
        ${s.visual_direction},
        ${s.audio_direction},
        ${s.on_screen_text},
        ${s.emotional_arc},
        ${s.compliance_review},
        ${s.medical_context_used},
        ${s.platform},
        ${s.duration},
        ${s.review_status || "draft"},
        ${s.airtable_record_id},
        ${s.created_at || new Date().toISOString()}
      )
    `;
    console.log(`  Inserted: ${s.script_title}`);
  }
  console.log("");

  // -----------------------------------------------
  // STEP 3: Generated Video Brief (1 record)
  // -----------------------------------------------
  console.log("Step 3: Inserting generated video brief (1 record)...");

  const [vbRequest] =
    await sql`SELECT id FROM video_brief_requests WHERE airtable_record_id = ${"recoGrjmuLSx6H3IY"}`;

  if (!vbRequest) console.error("  WARN: Video brief request recoGrjmuLSx6H3IY not found");

  const videoBriefs: any[] = JSON.parse(
    readFileSync(join(__dirname, "data", "generated-video-briefs.json"), "utf-8")
  );

  for (const vb of videoBriefs) {
    await sql`
      INSERT INTO generated_video_briefs (
        video_brief_request_id, brief_title, strategic_hypothesis, psychology_angle,
        content_type, target_persona, awareness_level, platform, duration,
        primary_hook, hook_variations_text, shot_list, b_roll_requirements,
        talent_notes, location_requirements, props_list, music_direction,
        sound_design, on_screen_text, visual_direction, compliance_review,
        brand_voice_lock, production_notes, status, airtable_record_id
      ) VALUES (
        ${vbRequest?.id || null},
        ${vb.brief_title},
        ${vb.strategic_hypothesis},
        ${vb.psychology_angle},
        ${vb.content_type},
        ${vb.target_persona},
        ${vb.awareness_level},
        ${vb.platform},
        ${vb.duration},
        ${vb.primary_hook},
        ${vb.hook_variations_text},
        ${vb.shot_list},
        ${vb.b_roll_requirements},
        ${vb.talent_notes},
        ${vb.location_requirements},
        ${vb.props_list},
        ${vb.music_direction},
        ${vb.sound_design},
        ${vb.on_screen_text},
        ${vb.visual_direction},
        ${vb.compliance_review},
        ${vb.brand_voice_lock},
        ${vb.production_notes},
        ${vb.status || "draft"},
        ${vb.airtable_record_id}
      )
    `;
    console.log(`  Inserted: ${vb.brief_title}`);
  }
  console.log("");

  // -----------------------------------------------
  // STEP 4: Script Reviews (4 records)
  // -----------------------------------------------
  console.log("Step 4: Inserting script reviews (4 records)...");

  for (const r of scriptReviews) {
    const agencyLevel = extractAwarenessLevel(r.agency_awareness_level);
    const aiLevel = extractAwarenessLevel(r.ai_awareness_level);

    await sql`
      INSERT INTO script_reviews (
        script_title, script_text, agency_awareness_level, product,
        target_persona, review_status, ai_awareness_level, awareness_mismatch,
        awareness_analysis, compliance_status, compliance_issues,
        corrected_script, changes_summary, brand_voice_alignment,
        overall_score, submitted_at, reviewed_at, airtable_record_id
      ) VALUES (
        ${r.script_title},
        ${r.script_text},
        ${agencyLevel},
        ${r.product},
        ${r.target_persona},
        ${r.review_status?.toLowerCase() === "review complete" ? "completed" : r.review_status?.toLowerCase() || "pending"},
        ${aiLevel},
        ${r.awareness_mismatch || false},
        ${r.awareness_analysis || null},
        ${r.compliance_status || null},
        ${r.compliance_issues || null},
        ${r.corrected_script || null},
        ${r.changes_summary || null},
        ${r.brand_voice_alignment || null},
        ${r.overall_score || null},
        ${r.submitted_at || null},
        ${r.reviewed_at || null},
        ${r.airtable_record_id}
      )
    `;
    console.log(`  Inserted: ${r.script_title}`);
  }
  console.log("");

  // -----------------------------------------------
  // VERIFICATION
  // -----------------------------------------------
  console.log("=".repeat(50));
  console.log("Phase 2 Migration Complete!");
  console.log("=".repeat(50));

  const counts = await sql`
    SELECT
      (SELECT count(*) FROM brand_intelligence) as brand_intelligence,
      (SELECT count(*) FROM generated_scripts) as generated_scripts,
      (SELECT count(*) FROM generated_video_briefs) as generated_video_briefs,
      (SELECT count(*) FROM script_reviews) as script_reviews,
      (SELECT count(*) FROM personas) as personas,
      (SELECT count(*) FROM awareness_levels) as awareness_levels,
      (SELECT count(*) FROM content_briefs) as content_briefs,
      (SELECT count(*) FROM hook_variations) as hook_variations,
      (SELECT count(*) FROM video_brief_requests) as video_brief_requests
  `;

  const c = counts[0];
  console.log("\nDatabase counts (all phases):");
  console.log(`  Brand Intelligence:     ${c.brand_intelligence} (expected: 1)`);
  console.log(`  Personas:               ${c.personas} (expected: 4)`);
  console.log(`  Awareness Levels:       ${c.awareness_levels} (expected: 5)`);
  console.log(`  Content Briefs:         ${c.content_briefs} (expected: 2)`);
  console.log(`  Generated Scripts:      ${c.generated_scripts} (expected: 2)`);
  console.log(`  Hook Variations:        ${c.hook_variations} (expected: 10)`);
  console.log(`  Video Brief Requests:   ${c.video_brief_requests} (expected: 1)`);
  console.log(`  Generated Video Briefs: ${c.generated_video_briefs} (expected: 1)`);
  console.log(`  Script Reviews:         ${c.script_reviews} (expected: 4)`);

  const phase2New =
    Number(c.generated_scripts) +
    Number(c.generated_video_briefs) +
    Number(c.script_reviews);
  console.log(`\nPhase 2 total new records: ${phase2New} (expected: 7)`);

  const biCheck =
    await sql`SELECT length(raw_content) as content_length FROM brand_intelligence LIMIT 1`;
  if (biCheck.length > 0) {
    console.log(`Brand intelligence content: ${biCheck[0].content_length} chars`);
  }

  await sql.end();
}

main().catch(async (e) => {
  console.error("Migration failed:", e);
  await sql.end();
  process.exit(1);
});
