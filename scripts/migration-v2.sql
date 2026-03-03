-- Migration V2: Add missing Airtable columns + new Video Brief tables
-- Run against Supabase via psql

-- =============================================
-- ADD AIRTABLE RECORD ID TO ALL CONTENT TABLES
-- =============================================

ALTER TABLE brand_intelligence ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE awareness_levels ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE winners ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE generated_scripts ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE hook_variations ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;
ALTER TABLE script_reviews ADD COLUMN IF NOT EXISTS airtable_record_id TEXT;

-- =============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================

-- awareness_levels: add examples, tone, warning
ALTER TABLE awareness_levels ADD COLUMN IF NOT EXISTS examples TEXT;
ALTER TABLE awareness_levels ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE awareness_levels ADD COLUMN IF NOT EXISTS warning TEXT;

-- personas: add compliance_note
ALTER TABLE personas ADD COLUMN IF NOT EXISTS compliance_note TEXT;

-- winners: add status, angle_direction
ALTER TABLE winners ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE winners ADD COLUMN IF NOT EXISTS angle_direction TEXT;

-- content_briefs: add requested_variants
ALTER TABLE content_briefs ADD COLUMN IF NOT EXISTS requested_variants INTEGER;

-- =============================================
-- CREATE VIDEO BRIEF REQUESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS video_brief_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_name TEXT NOT NULL,
  content_type TEXT,
  scenario_description TEXT,
  target_objection TEXT,
  angle_direction TEXT,
  persona TEXT,
  awareness_level TEXT,
  platform TEXT,
  duration TEXT,
  language TEXT DEFAULT 'FR',
  production_constraints TEXT,
  proof_assets JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  airtable_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CREATE GENERATED VIDEO BRIEFS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS generated_video_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_brief_request_id UUID REFERENCES video_brief_requests(id),
  brief_title TEXT,
  strategic_hypothesis TEXT,
  psychology_angle TEXT,
  content_type TEXT,
  target_persona TEXT,
  awareness_level TEXT,
  platform TEXT,
  duration TEXT,
  primary_hook TEXT,
  hook_variations_text TEXT,
  shot_list TEXT,
  b_roll_requirements TEXT,
  talent_notes TEXT,
  location_requirements TEXT,
  props_list TEXT,
  music_direction TEXT,
  sound_design TEXT,
  on_screen_text TEXT,
  visual_direction TEXT,
  compliance_review TEXT,
  brand_voice_lock TEXT,
  production_notes TEXT,
  status TEXT DEFAULT 'draft',
  airtable_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR NEW TABLES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_video_brief_requests_status ON video_brief_requests(status);
CREATE INDEX IF NOT EXISTS idx_gen_video_briefs_request ON generated_video_briefs(video_brief_request_id);
CREATE INDEX IF NOT EXISTS idx_video_brief_requests_airtable ON video_brief_requests(airtable_record_id);
CREATE INDEX IF NOT EXISTS idx_gen_video_briefs_airtable ON generated_video_briefs(airtable_record_id);

-- =============================================
-- ENABLE REALTIME FOR NEW TABLES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE video_brief_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE generated_video_briefs;
