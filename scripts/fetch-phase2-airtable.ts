/**
 * Fetches Phase 2 Airtable records and saves them as JSON data files.
 * Requires AIRTABLE_TOKEN environment variable.
 *
 * Usage: AIRTABLE_TOKEN=pat... npx tsx scripts/fetch-phase2-airtable.ts
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");

const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) {
  console.error("AIRTABLE_TOKEN not set");
  process.exit(1);
}

const BASE2 = "appziTBO4sBPJvh5l"; // Naali Script Generation System

async function fetchRecord(baseId: string, tableId: string, recordId: string) {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

function mapScript(recordId: string, fields: any, createdAt: string) {
  return {
    airtable_record_id: recordId,
    script_title: fields["Script Title"] ?? null,
    content_type: fields["Content Type"] ?? null,
    full_script: fields["Full Script"] ?? null,
    thinking_sequence: fields["Naali Thinking Sequence"] ?? null,
    dialogue: fields["Dialogue"] ?? null,
    scene_breakdown: fields["Scene Breakdown"] ?? null,
    visual_direction: fields["Visual Direction"] ?? null,
    audio_direction: fields["Audio Direction"] ?? null,
    on_screen_text: fields["On-Screen Text"] ?? null,
    emotional_arc: fields["Emotional Arc"] ?? null,
    compliance_review: fields["Compliance Review"] ?? null,
    medical_context_used: fields["Medical Context Used"] ?? null,
    platform: fields["Platform"] ?? null,
    duration: fields["Duration"] ?? null,
    review_status: (fields["Status"] ?? "Draft").toLowerCase(),
    created_at: createdAt,
  };
}

function mapVideoBrief(recordId: string, fields: any) {
  return {
    airtable_record_id: recordId,
    brief_title: fields["Brief Title"] ?? null,
    strategic_hypothesis: fields["Strategic Hypothesis"] ?? null,
    psychology_angle: fields["Psychology Angle"] ?? null,
    content_type: fields["Content Type"] ?? null,
    target_persona: fields["Target Persona"] ?? null,
    awareness_level: fields["Awareness Level"] ?? null,
    platform: fields["Platform"] ?? null,
    duration: fields["Duration"] ?? null,
    primary_hook: fields["Primary Hook"] ?? null,
    hook_variations_text: fields["Hook Variations"] ?? null,
    shot_list: fields["Shot List"] ?? null,
    b_roll_requirements: fields["B-Roll Requirements"] ?? null,
    talent_notes: fields["Talent Notes"] ?? null,
    location_requirements: fields["Location Requirements"] ?? null,
    props_list: fields["Props List"] ?? null,
    music_direction: fields["Music Direction"] ?? null,
    sound_design: fields["Sound Design"] ?? null,
    on_screen_text: fields["On-Screen Text"] ?? null,
    visual_direction: fields["Visual Direction"] ?? null,
    compliance_review: fields["Compliance Review"] ?? null,
    brand_voice_lock: fields["Brand Voice Lock"] ?? null,
    production_notes: fields["Production Notes"] ?? null,
    status: (fields["Status"] ?? "Draft").toLowerCase(),
  };
}

async function main() {
  console.log("Fetching Phase 2 Airtable records...\n");

  // Generated Scripts
  const s1 = await fetchRecord(BASE2, "tblZsfk0ysaz5juZP", "recmbQWI6EbHD5YdY");
  const s2 = await fetchRecord(BASE2, "tblZsfk0ysaz5juZP", "recsYmv2Rh9yFsANo");
  const scripts = [
    mapScript("recmbQWI6EbHD5YdY", s1.fields, "2026-03-03T00:00:00.000Z"),
    mapScript("recsYmv2Rh9yFsANo", s2.fields, "2026-02-24T00:00:00.000Z"),
  ];
  writeFileSync(join(DATA_DIR, "generated-scripts.json"), JSON.stringify(scripts, null, 2), "utf-8");
  console.log(`Written generated-scripts.json (${scripts.length} records)`);

  // Generated Video Brief
  const vb = await fetchRecord(BASE2, "tblVFY22dsNSIGeRx", "recqLpzFoesKfbymy");
  const briefs = [mapVideoBrief("recqLpzFoesKfbymy", vb.fields)];
  writeFileSync(join(DATA_DIR, "generated-video-briefs.json"), JSON.stringify(briefs, null, 2), "utf-8");
  console.log(`Written generated-video-briefs.json (${briefs.length} records)`);

  console.log("\nDone! Now run: DOTENV_CONFIG_PATH=.env.local npx tsx scripts/migrate-phase2.ts");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
