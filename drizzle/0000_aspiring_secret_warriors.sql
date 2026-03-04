CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" text NOT NULL,
	"brand_color" text DEFAULT '#6366f1',
	"logo_url" text,
	"portal_title" text,
	"features" jsonb DEFAULT '{"script_generation":true,"script_review":true,"brand_intel_editing":true,"winners_library":true,"hook_variations":true}'::jsonb NOT NULL,
	"workflows" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_types" jsonb DEFAULT '["UGC","Founder-led","Testimonial","Podcast/Interview","Native","VSL"]'::jsonb,
	"platforms" jsonb DEFAULT '["Meta","TikTok","Instagram","All Platforms"]'::jsonb,
	"durations" jsonb DEFAULT '["15s","30s","45s","60s"]'::jsonb,
	"languages" jsonb DEFAULT '["FR"]'::jsonb,
	"target_objections" jsonb DEFAULT '["Another supplement won't work","Too expensive","Not legit","I don't want medication","I tried magnesium","Tisanes didn't work","I don't have energy/time","Is it safe?","I need something stronger","Why Naali vs pharmacy brands?"]'::jsonb,
	"proof_asset_options" jsonb DEFAULT '["Reviews wall","Comment screenshots","Thousands of women messaging","M6 appearance","Founder story","Founder education","Warehouse footage","Routine footage","Raw UGC testimonial"]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "awareness_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"script_objective" text,
	"hook_style" text,
	"creative_guidelines" text,
	"examples" text,
	"tone" text,
	"warning" text,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "awareness_levels_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "brand_intelligence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text DEFAULT 'Brand Intelligence' NOT NULL,
	"raw_content" text,
	"sections" jsonb,
	"airtable_record_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"brief_name" text NOT NULL,
	"content_type" text,
	"scenario_description" text,
	"target_objection" text,
	"angle_direction" text,
	"proof_assets" jsonb,
	"persona_id" uuid,
	"awareness_level_id" uuid,
	"platform" text,
	"duration" text,
	"language" text DEFAULT 'FR',
	"tone_override" text,
	"notes" text,
	"winner_ids" jsonb,
	"requested_variants" integer,
	"status" text DEFAULT 'new' NOT NULL,
	"error_message" text,
	"n8n_execution_id" text,
	"triggered_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"script_title" text,
	"content_type" text,
	"full_script" text,
	"thinking_sequence" text,
	"dialogue" text,
	"scene_breakdown" text,
	"visual_direction" text,
	"audio_direction" text,
	"on_screen_text" text,
	"emotional_arc" text,
	"compliance_review" text,
	"medical_context_used" text,
	"platform" text,
	"duration" text,
	"review_status" text DEFAULT 'draft',
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_video_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_brief_request_id" uuid,
	"brief_title" text,
	"strategic_hypothesis" text,
	"psychology_angle" text,
	"content_type" text,
	"target_persona" text,
	"awareness_level" text,
	"platform" text,
	"duration" text,
	"primary_hook" text,
	"hook_variations_text" text,
	"shot_list" text,
	"b_roll_requirements" text,
	"talent_notes" text,
	"location_requirements" text,
	"props_list" text,
	"music_direction" text,
	"sound_design" text,
	"on_screen_text" text,
	"visual_direction" text,
	"compliance_review" text,
	"brand_voice_lock" text,
	"production_notes" text,
	"status" text DEFAULT 'draft',
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hook_variations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"script_id" uuid NOT NULL,
	"hook_title" text,
	"hook_type" text,
	"hook_text" text,
	"visual_description" text,
	"why_it_works" text,
	"platform_best_fit" text,
	"estimated_stop_rate" text,
	"sort_order" integer DEFAULT 0,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text,
	"demographics" text,
	"situation" text,
	"pain_points" text,
	"what_they_tried" text,
	"what_they_want" text,
	"objections" text,
	"conversion_triggers" text,
	"messaging_notes" text,
	"compliance_note" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitted_by" uuid,
	"script_title" text NOT NULL,
	"script_text" text NOT NULL,
	"agency_awareness_level" integer,
	"product" text,
	"target_persona" text,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"review_status" text DEFAULT 'pending',
	"ai_awareness_level" integer,
	"awareness_mismatch" boolean DEFAULT false,
	"awareness_analysis" text,
	"compliance_status" text,
	"compliance_issues" text,
	"corrected_script" text,
	"changes_summary" text,
	"brand_voice_alignment" text,
	"overall_score" integer,
	"reviewed_at" timestamp with time zone,
	"approval_decision" text,
	"client_notes" text,
	"decided_at" timestamp with time zone,
	"decided_by" uuid,
	"n8n_execution_id" text,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "video_brief_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_name" text NOT NULL,
	"content_type" text,
	"scenario_description" text,
	"target_objection" text,
	"angle_direction" text,
	"persona" text,
	"awareness_level" text,
	"platform" text,
	"duration" text,
	"language" text DEFAULT 'FR',
	"production_constraints" text,
	"proof_assets" jsonb,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"platform" text,
	"media_url" text,
	"ai_summary" text,
	"notes" text,
	"status" text,
	"angle_direction" text,
	"airtable_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_awareness_level_id_awareness_levels_id_fk" FOREIGN KEY ("awareness_level_id") REFERENCES "public"."awareness_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_scripts" ADD CONSTRAINT "generated_scripts_brief_id_content_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."content_briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_scripts" ADD CONSTRAINT "generated_scripts_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_video_briefs" ADD CONSTRAINT "generated_video_briefs_video_brief_request_id_video_brief_requests_id_fk" FOREIGN KEY ("video_brief_request_id") REFERENCES "public"."video_brief_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hook_variations" ADD CONSTRAINT "hook_variations_script_id_generated_scripts_id_fk" FOREIGN KEY ("script_id") REFERENCES "public"."generated_scripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_reviews" ADD CONSTRAINT "script_reviews_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_reviews" ADD CONSTRAINT "script_reviews_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;