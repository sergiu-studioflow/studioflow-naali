import { pgTable, text, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

// =============================================
// BETTER AUTH TABLES (managed by better-auth — do not modify manually)
// =============================================

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// =============================================
// USERS (portal profile — linked to Better Auth user)
// =============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => authUser.id, { onDelete: "cascade" }),
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
  targetObjections: jsonb("target_objections"),
  proofAssetOptions: jsonb("proof_asset_options"),
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
  estimatedShare: text("estimated_share"),
  dominantAngles: text("dominant_angles"),
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
// TARGET OBJECTIONS
// =============================================

export const targetObjections = pgTable("target_objections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// PROOF ASSETS
// =============================================

export const proofAssets = pgTable("proof_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// MOTIVATORS
// =============================================

export const motivators = pgTable("motivators", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  mainAngle: text("main_angle").notNull(),
  mainAngleEstimatedShare: text("main_angle_estimated_share"),
  mainAngleDescription: text("main_angle_description"),
  subAngle: text("sub_angle").notNull(),
  painPointRelief: text("pain_point_relief"),
  coreMotivation: text("core_motivation"),
  typicalTriggers: text("typical_triggers"),
  representativeQuotes: text("representative_quotes"),
  emotionalTone: text("emotional_tone"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// PRODUCTS
// =============================================

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// AD STYLES (Static Ad System)
// =============================================

export const adStyles = pgTable("ad_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  masterPrompt: text("master_prompt").notNull(),
  referenceImageUrl: text("reference_image_url"),
  thumbnailUrl: text("thumbnail_url"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adStylePrompts = pgTable("ad_style_prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  adStyleId: uuid("ad_style_id").notNull().references(() => adStyles.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staticAdGenerations = pgTable("static_ad_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  adStyleId: uuid("ad_style_id").references(() => adStyles.id),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  styleName: text("style_name"),
  productName: text("product_name"),
  finalPrompt: text("final_prompt"),
  kieJobId: text("kie_job_id"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  resolution: text("resolution").default("1K"),
  outputFormat: text("output_format").default("PNG"),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  mode: text("mode").notNull().default("default"),
  referenceImageUrl: text("reference_image_url"),
  adCopy: text("ad_copy"),
  analysisJson: text("analysis_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// REFERENCE AD LIBRARY (shared across portals)
// =============================================

export const referenceAdLibrary = pgTable("reference_ad_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  industry: text("industry").notNull().default("beauty"),
  adType: text("ad_type"),
  brand: text("brand"),
  tags: text("tags"),
  airtableRecordId: text("airtable_record_id").unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// WINNERS LIBRARY (per-client saved winning ads)
// =============================================

export const winnersLibrary = pgTable("winners_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  sourceGenerationId: uuid("source_generation_id"),
  productName: text("product_name"),
  tags: text("tags"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// WINNERS (script generation reference ads)
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
  productId: uuid("product_id").references(() => products.id),
  platform: text("platform"),
  duration: text("duration"),
  language: text("language").default("FR"),
  toneOverride: text("tone_override"),
  notes: text("notes"),
  motivator: text("motivator"),
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
  scriptId: uuid("script_id").references(() => generatedScripts.id, { onDelete: "cascade" }),

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

  // Source tracking
  sourceType: text("source_type").default("manual"), // manual, auto
  generatedScriptId: uuid("generated_script_id").references(() => generatedScripts.id),

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
  productFocus: text("product_focus"),
  platform: text("platform"),
  duration: text("duration"),
  language: text("language").default("FR"),
  productionConstraints: text("production_constraints"),
  proofAssets: jsonb("proof_assets"),
  notes: text("notes"),
  motivator: text("motivator"),
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

// =============================================
// CSV IMPORTS (upload tracking)
// =============================================

export const csvImports = pgTable("csv_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  fileName: text("file_name").notNull(),
  sourceType: text("source_type").notNull(), // asg_survey, mag_survey, menopause_survey, reorder_survey
  rowCount: integer("row_count").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing, complete, error
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// CUSTOMER REVIEWS (normalized across all sources)
// =============================================

export const customerReviews = pgTable("customer_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  importId: uuid("import_id").references(() => csvImports.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(), // asg_survey, mag_survey, menopause_survey, reorder_survey
  productContext: text("product_context"), // Anti-Stress Gummies, Magnesium+, Menopause, Multiple/Unknown

  // Customer info
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  totalSpent: text("total_spent"),
  ordersCount: integer("orders_count"),

  // Core review content (normalized)
  mainProblem: text("main_problem"),
  problemDescription: text("problem_description"),
  dailyImpact: text("daily_impact"),
  moodWords: text("mood_words"),
  purchaseHesitations: text("purchase_hesitations"),
  whatConvinced: text("what_convinced"),
  whyPurchased: text("why_purchased"),
  expectedOutcome: text("expected_outcome"),
  reviewText: text("review_text"), // Main testimonial / reorder reason
  symptoms: jsonb("symptoms"), // Array of symptom strings (menopause)

  // Discovery & attribution
  discoverySource: text("discovery_source"),
  influencerSource: text("influencer_source"),
  utmSource: text("utm_source"),

  // Full original row
  rawData: jsonb("raw_data"),

  // Dates
  submittedAt: text("submitted_at"), // Original date from CSV
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================
// MINED ANGLES (AI-generated angle briefs)
// =============================================

export const minedAngles = pgTable("mined_angles", {
  id: uuid("id").primaryKey().defaultRandom(),
  miningRunId: text("mining_run_id").notNull(),
  angleName: text("angle_name").notNull(),
  targetPersona: text("target_persona"), // Marie, Sophie, Nathalie, Céline
  awarenessLevel: text("awareness_level"), // 1-5 mapped
  keyInsight: text("key_insight").notNull(),
  supportingQuotes: jsonb("supporting_quotes"), // [{quote, sourceType, reviewId?}]
  painPointCluster: text("pain_point_cluster"),
  emotionalTrigger: text("emotional_trigger"),
  complianceNotes: text("compliance_notes"),
  suggestedHookDirection: text("suggested_hook_direction"),
  suggestedAngleType: text("suggested_angle_type"), // Testimonial proof, Problem agitation, etc.
  reviewsAnalyzed: integer("reviews_analyzed"),
  confidence: text("confidence"), // high, medium, low
  status: text("status").notNull().default("new"), // new, approved, rejected
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
