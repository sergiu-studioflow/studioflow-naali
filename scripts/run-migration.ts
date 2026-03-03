import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve } from "path";

// Supabase transaction pooler
const sql = postgres(
  "postgresql://postgres.caxsquldkzmcabjhjfqh:StudioFlow2026@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
  { max: 1, idle_timeout: 20, connect_timeout: 10, prepare: false }
);

async function main() {
  // Test connection first
  console.log("Testing connection...");
  const test = await sql`SELECT current_database() as db`;
  console.log(`Connected to: ${test[0].db}\n`);

  console.log("Creating tables...\n");

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_user_id UUID NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ users");

  // App Config
  await sql`
    CREATE TABLE IF NOT EXISTS app_config (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_name TEXT NOT NULL,
      brand_color TEXT DEFAULT '#6366f1',
      logo_url TEXT,
      portal_title TEXT,
      features JSONB NOT NULL DEFAULT '{"script_generation": true, "script_review": true, "brand_intel_editing": true, "winners_library": true, "hook_variations": true}'::jsonb,
      workflows JSONB NOT NULL DEFAULT '{}'::jsonb,
      content_types JSONB DEFAULT '["UGC", "Founder-led", "Testimonial", "Podcast/Interview", "Native", "VSL"]'::jsonb,
      platforms JSONB DEFAULT '["Meta", "TikTok", "Instagram", "All Platforms"]'::jsonb,
      durations JSONB DEFAULT '["15s", "30s", "45s", "60s"]'::jsonb,
      languages JSONB DEFAULT '["FR"]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ app_config");

  // Brand Intelligence
  await sql`
    CREATE TABLE IF NOT EXISTS brand_intelligence (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL DEFAULT 'Brand Intelligence',
      raw_content TEXT,
      sections JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ brand_intelligence");

  // Personas
  await sql`
    CREATE TABLE IF NOT EXISTS personas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      label TEXT,
      demographics TEXT,
      situation TEXT,
      pain_points TEXT,
      what_they_tried TEXT,
      what_they_want TEXT,
      objections TEXT,
      conversion_triggers TEXT,
      messaging_notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ personas");

  // Awareness Levels
  await sql`
    CREATE TABLE IF NOT EXISTS awareness_levels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      level INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      script_objective TEXT,
      hook_style TEXT,
      creative_guidelines TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ awareness_levels");

  // Winners
  await sql`
    CREATE TABLE IF NOT EXISTS winners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      platform TEXT,
      media_url TEXT,
      ai_summary TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ winners");

  // Content Briefs
  await sql`
    CREATE TABLE IF NOT EXISTS content_briefs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_by UUID REFERENCES users(id),
      brief_name TEXT NOT NULL,
      content_type TEXT,
      scenario_description TEXT,
      target_objection TEXT,
      angle_direction TEXT,
      proof_assets JSONB,
      persona_id UUID REFERENCES personas(id),
      awareness_level_id UUID REFERENCES awareness_levels(id),
      platform TEXT,
      duration TEXT,
      language TEXT DEFAULT 'FR',
      tone_override TEXT,
      notes TEXT,
      winner_ids JSONB,
      status TEXT NOT NULL DEFAULT 'new',
      error_message TEXT,
      n8n_execution_id TEXT,
      triggered_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ content_briefs");

  // Generated Scripts
  await sql`
    CREATE TABLE IF NOT EXISTS generated_scripts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brief_id UUID NOT NULL REFERENCES content_briefs(id),
      script_title TEXT,
      content_type TEXT,
      full_script TEXT,
      thinking_sequence TEXT,
      dialogue TEXT,
      scene_breakdown TEXT,
      visual_direction TEXT,
      audio_direction TEXT,
      on_screen_text TEXT,
      emotional_arc TEXT,
      compliance_review TEXT,
      medical_context_used TEXT,
      platform TEXT,
      duration TEXT,
      review_status TEXT DEFAULT 'draft',
      review_notes TEXT,
      reviewed_at TIMESTAMPTZ,
      reviewed_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ generated_scripts");

  // Hook Variations
  await sql`
    CREATE TABLE IF NOT EXISTS hook_variations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      script_id UUID NOT NULL REFERENCES generated_scripts(id) ON DELETE CASCADE,
      hook_title TEXT,
      hook_type TEXT,
      hook_text TEXT,
      visual_description TEXT,
      why_it_works TEXT,
      platform_best_fit TEXT,
      estimated_stop_rate TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ hook_variations");

  // Script Reviews
  await sql`
    CREATE TABLE IF NOT EXISTS script_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submitted_by UUID REFERENCES users(id),
      script_title TEXT NOT NULL,
      script_text TEXT NOT NULL,
      agency_awareness_level INTEGER,
      product TEXT,
      target_persona TEXT,
      submitted_at TIMESTAMPTZ DEFAULT now(),
      review_status TEXT DEFAULT 'pending',
      ai_awareness_level INTEGER,
      awareness_mismatch BOOLEAN DEFAULT false,
      awareness_analysis TEXT,
      compliance_status TEXT,
      compliance_issues TEXT,
      corrected_script TEXT,
      changes_summary TEXT,
      brand_voice_alignment TEXT,
      overall_score INTEGER,
      reviewed_at TIMESTAMPTZ,
      approval_decision TEXT,
      client_notes TEXT,
      decided_at TIMESTAMPTZ,
      decided_by UUID REFERENCES users(id),
      n8n_execution_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ script_reviews");

  // Activity Log
  await sql`
    CREATE TABLE IF NOT EXISTS activity_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id UUID,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("  ✓ activity_log");

  console.log("\nCreating indexes...\n");

  await sql`CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_user_id)`;
  console.log("  ✓ idx_users_auth");
  await sql`CREATE INDEX IF NOT EXISTS idx_briefs_status ON content_briefs(status)`;
  console.log("  ✓ idx_briefs_status");
  await sql`CREATE INDEX IF NOT EXISTS idx_briefs_created ON content_briefs(created_at DESC)`;
  console.log("  ✓ idx_briefs_created");
  await sql`CREATE INDEX IF NOT EXISTS idx_scripts_brief ON generated_scripts(brief_id)`;
  console.log("  ✓ idx_scripts_brief");
  await sql`CREATE INDEX IF NOT EXISTS idx_hooks_script ON hook_variations(script_id)`;
  console.log("  ✓ idx_hooks_script");
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_status ON script_reviews(review_status)`;
  console.log("  ✓ idx_reviews_status");
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC)`;
  console.log("  ✓ idx_activity_created");

  console.log("\nEnabling realtime...\n");

  try {
    await sql`ALTER PUBLICATION supabase_realtime ADD TABLE content_briefs`;
    console.log("  ✓ content_briefs realtime");
  } catch (e: any) {
    console.log(`  ⊘ content_briefs realtime (${e.message || "already enabled"})`);
  }
  try {
    await sql`ALTER PUBLICATION supabase_realtime ADD TABLE generated_scripts`;
    console.log("  ✓ generated_scripts realtime");
  } catch (e: any) {
    console.log(`  ⊘ generated_scripts realtime (${e.message || "already enabled"})`);
  }
  try {
    await sql`ALTER PUBLICATION supabase_realtime ADD TABLE script_reviews`;
    console.log("  ✓ script_reviews realtime");
  } catch (e: any) {
    console.log(`  ⊘ script_reviews realtime (${e.message || "already enabled"})`);
  }

  console.log("\n✅ Migration complete!");
  await sql.end();
}

main().catch(async (err) => {
  console.error("Migration failed:", err);
  await sql.end();
  process.exit(1);
});
