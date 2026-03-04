import { pgTable, text, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

// =============================================
// USERS & AUTH
// =============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // admin, member, viewer
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// APP CONFIGURATION (single row)
// =============================================

export const appConfig = pgTable("app_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  brandColor: text("brand_color").default("#6366f1"),
  logoUrl: text("logo_url"),
  portalTitle: text("portal_title"),
  features: jsonb("features").notNull().default({
    script_generation: true,
    script_review: true,
    brand_intel_editing: true,
    winners_library: true,
    hook_variations: true,
  }),
  workflows: jsonb("workflows").notNull().default({}),
  contentTypes: jsonb("content_types").default(["UGC", "Founder-led", "Testimonial", "Podcast/Interview", "Native", "VSL"]),
  platforms: jsonb("platforms").default(["Meta", "TikTok", "Instagram", "All Platforms"]),
  durations: jsonb("durations").default(["15s", "30s", "45s", "60s"]),
  languages: jsonb("languages").default(["FR"]),
  targetObjections: jsonb("target_objections").default([
    "Another supplement won't work", "Too expensive", "Not legit",
    "I don't want medication", "I tried magnesium", "Tisanes didn't work",
    "I don't have energy/time", "Is it safe?", "I need something stronger",
    "Why Naali vs pharmacy brands?",
  ]),
  proofAssetOptions: jsonb("proof_asset_options").default([
    "Reviews wall", "Comment screenshots", "Thousands of women messaging",
    "M6 appearance", "Founder story", "Founder education",
    "Warehouse footage", "Routine footage", "Raw UGC testimonial",
  ]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// BRAND INTELLIGENCE
// =============================================

export const brandIntelligence = pgTable("brand_intelligence", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("Brand Intelligence"),
  rawContent: text("raw_content"), // Full markdown document
  sections: jsonb("sections"), // Parsed sections as JSON
  airtableRecordId: text("airtable_record_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// PERSONAS
// =============================================

export const personas = pgTable("personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  label: text("label"),
  demographics: text("demographics"),
  situation: text("situation"),
  painPoints: text("pain_points"),
  whatTheyTried: text("what_they_tried"),
  whatTheyWant: text("what_they_want"),
  objections: text("objections"),
  conversionTriggers: text("conversion_triggers"),
  messagingNotes: text("messaging_notes"),
  complianceNote: text("compliance_note"),
  sortOrder: integer("sort_order").notNull().default(0),
  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// AWARENESS LEVELS
// =============================================

export const awarenessLevels = pgTable("awareness_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  level: integer("level").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  scriptObjective: text("script_objective"),
  hookStyle: text("hook_style"),
  creativeGuidelines: text("creative_guidelines"),
  examples: text("examples"),
  tone: text("tone"),
  warning: text("warning"),
  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// WINNERS LIBRARY
// =============================================

export const winners = pgTable("winners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  platform: text("platform"),
  mediaUrl: text("media_url"),
  aiSummary: text("ai_summary"),
  notes: text("notes"),
  status: text("status"),
  angleDirection: text("angle_direction"),
  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// CONTENT BRIEFS (input/trigger table)
// =============================================

export const contentBriefs = pgTable("content_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").references(() => users.id),

  // Brief inputs
  briefName: text("brief_name").notNull(),
  contentType: text("content_type"),
  scenarioDescription: text("scenario_description"),
  targetObjection: text("target_objection"),
  angleDirection: text("angle_direction"),
  proofAssets: jsonb("proof_assets"), // JSON array
  personaId: uuid("persona_id").references(() => personas.id),
  awarenessLevelId: uuid("awareness_level_id").references(() => awarenessLevels.id),
  platform: text("platform"),
  duration: text("duration"),
  language: text("language").default("FR"),
  toneOverride: text("tone_override"),
  notes: text("notes"),
  winnerIds: jsonb("winner_ids"), // JSON array of winner UUIDs
  requestedVariants: integer("requested_variants"),

  // Status lifecycle
  status: text("status").notNull().default("new"), // new, processing, complete, error
  errorMessage: text("error_message"),

  // Workflow tracking
  n8nExecutionId: text("n8n_execution_id"),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),

  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// GENERATED SCRIPTS
// =============================================

export const generatedScripts = pgTable("generated_scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefId: uuid("brief_id").notNull().references(() => contentBriefs.id),

  // AI-generated content
  scriptTitle: text("script_title"),
  contentType: text("content_type"),
  fullScript: text("full_script"),
  thinkingSequence: text("thinking_sequence"),
  dialogue: text("dialogue"),
  sceneBreakdown: text("scene_breakdown"),
  visualDirection: text("visual_direction"),
  audioDirection: text("audio_direction"),
  onScreenText: text("on_screen_text"),
  emotionalArc: text("emotional_arc"),
  complianceReview: text("compliance_review"),
  medicalContextUsed: text("medical_context_used"),

  // Metadata
  platform: text("platform"),
  duration: text("duration"),

  // Review status
  reviewStatus: text("review_status").default("draft"), // draft, approved, revision_needed, in_production, rejected
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id),

  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// HOOK VARIATIONS
// =============================================

export const hookVariations = pgTable("hook_variations", {
  id: uuid("id").primaryKey().defaultRandom(),
  scriptId: uuid("script_id").notNull().references(() => generatedScripts.id, { onDelete: "cascade" }),

  hookTitle: text("hook_title"),
  hookType: text("hook_type"), // Question, Fact, Pattern Interrupt, Emotional, Curiosity Gap
  hookText: text("hook_text"),
  visualDescription: text("visual_description"),
  whyItWorks: text("why_it_works"),
  platformBestFit: text("platform_best_fit"),
  estimatedStopRate: text("estimated_stop_rate"), // High, Medium, Low
  sortOrder: integer("sort_order").default(0),

  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// SCRIPT REVIEWS
// =============================================

export const scriptReviews = pgTable("script_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  submittedBy: uuid("submitted_by").references(() => users.id),

  // Submitted script
  scriptTitle: text("script_title").notNull(),
  scriptText: text("script_text").notNull(),
  agencyAwarenessLevel: integer("agency_awareness_level"),
  product: text("product"),
  targetPersona: text("target_persona"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),

  // AI review results
  reviewStatus: text("review_status").default("pending"), // pending, under_review, review_complete
  aiAwarenessLevel: integer("ai_awareness_level"),
  awarenessMismatch: boolean("awareness_mismatch").default(false),
  awarenessAnalysis: text("awareness_analysis"),
  complianceStatus: text("compliance_status"), // compliant, non_compliant, needs_minor_fixes
  complianceIssues: text("compliance_issues"),
  correctedScript: text("corrected_script"),
  changesSummary: text("changes_summary"),
  brandVoiceAlignment: text("brand_voice_alignment"),
  overallScore: integer("overall_score"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  // Client decision
  approvalDecision: text("approval_decision"), // approved, approved_with_notes, send_back, rejected
  clientNotes: text("client_notes"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  decidedBy: uuid("decided_by").references(() => users.id),

  // Workflow tracking
  n8nExecutionId: text("n8n_execution_id"),

  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// VIDEO BRIEF REQUESTS
// =============================================

export const videoBriefRequests = pgTable("video_brief_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  briefName: text("brief_name").notNull(),
  contentType: text("content_type"),
  scenarioDescription: text("scenario_description"),
  targetObjection: text("target_objection"),
  angleDirection: text("angle_direction"),
  persona: text("persona"),
  awarenessLevel: text("awareness_level"),
  platform: text("platform"),
  duration: text("duration"),
  language: text("language").default("FR"),
  productionConstraints: text("production_constraints"),
  proofAssets: jsonb("proof_assets"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// GENERATED VIDEO BRIEFS
// =============================================

export const generatedVideoBriefs = pgTable("generated_video_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoBriefRequestId: uuid("video_brief_request_id").references(() => videoBriefRequests.id),
  briefTitle: text("brief_title"),
  strategicHypothesis: text("strategic_hypothesis"),
  psychologyAngle: text("psychology_angle"),
  contentType: text("content_type"),
  targetPersona: text("target_persona"),
  awarenessLevel: text("awareness_level"),
  platform: text("platform"),
  duration: text("duration"),
  primaryHook: text("primary_hook"),
  hookVariationsText: text("hook_variations_text"),
  shotList: text("shot_list"),
  bRollRequirements: text("b_roll_requirements"),
  talentNotes: text("talent_notes"),
  locationRequirements: text("location_requirements"),
  propsList: text("props_list"),
  musicDirection: text("music_direction"),
  soundDesign: text("sound_design"),
  onScreenText: text("on_screen_text"),
  visualDirection: text("visual_direction"),
  complianceReview: text("compliance_review"),
  brandVoiceLock: text("brand_voice_lock"),
  productionNotes: text("production_notes"),
  status: text("status").default("draft"),
  airtableRecordId: text("airtable_record_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// ACTIVITY LOG
// =============================================

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(), // brief_created, script_generated, review_completed, etc.
  resourceType: text("resource_type").notNull(), // brief, script, review, brand_intel
  resourceId: uuid("resource_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
