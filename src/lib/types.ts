// Inferred types from Drizzle schema
export type User = {
  id: string;
  authUserId: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppConfig = {
  id: string;
  brandName: string;
  brandColor: string | null;
  logoUrl: string | null;
  portalTitle: string | null;
  features: Record<string, boolean>;
  workflows: Record<string, { webhook_path: string; n8n_base_url?: string }>;
  contentTypes: string[];
  platforms: string[];
  durations: string[];
  languages: string[];
};

export type Persona = {
  id: string;
  name: string;
  label: string | null;
  demographics: string | null;
  situation: string | null;
  painPoints: string | null;
  whatTheyTried: string | null;
  whatTheyWant: string | null;
  objections: string | null;
  conversionTriggers: string | null;
  messagingNotes: string | null;
  sortOrder: number;
};

export type AwarenessLevel = {
  id: string;
  level: number;
  name: string;
  description: string | null;
  scriptObjective: string | null;
  hookStyle: string | null;
  creativeGuidelines: string | null;
};

export type ContentBrief = {
  id: string;
  createdBy: string | null;
  briefName: string;
  contentType: string | null;
  scenarioDescription: string | null;
  targetObjection: string | null;
  angleDirection: string | null;
  proofAssets: string[] | null;
  personaId: string | null;
  awarenessLevelId: string | null;
  platform: string | null;
  duration: string | null;
  language: string | null;
  toneOverride: string | null;
  notes: string | null;
  winnerIds: string[] | null;
  status: string;
  errorMessage: string | null;
  n8nExecutionId: string | null;
  triggeredAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GeneratedScript = {
  id: string;
  briefId: string;
  scriptTitle: string | null;
  contentType: string | null;
  fullScript: string | null;
  thinkingSequence: string | null;
  dialogue: string | null;
  sceneBreakdown: string | null;
  visualDirection: string | null;
  audioDirection: string | null;
  onScreenText: string | null;
  emotionalArc: string | null;
  complianceReview: string | null;
  medicalContextUsed: string | null;
  platform: string | null;
  duration: string | null;
  reviewStatus: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type HookVariation = {
  id: string;
  scriptId: string;
  hookTitle: string | null;
  hookType: string | null;
  hookText: string | null;
  visualDescription: string | null;
  whyItWorks: string | null;
  platformBestFit: string | null;
  estimatedStopRate: string | null;
  sortOrder: number | null;
  createdAt: Date;
};

export type ScriptReview = {
  id: string;
  submittedBy: string | null;
  scriptTitle: string;
  scriptText: string;
  agencyAwarenessLevel: number | null;
  product: string | null;
  targetPersona: string | null;
  submittedAt: Date | null;
  reviewStatus: string | null;
  aiAwarenessLevel: number | null;
  awarenessMismatch: boolean | null;
  awarenessAnalysis: string | null;
  complianceStatus: string | null;
  complianceIssues: string | null;
  correctedScript: string | null;
  changesSummary: string | null;
  brandVoiceAlignment: string | null;
  overallScore: number | null;
  reviewedAt: Date | null;
  approvalDecision: string | null;
  clientNotes: string | null;
  decidedAt: Date | null;
  decidedBy: string | null;
  n8nExecutionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Winner = {
  id: string;
  name: string;
  platform: string | null;
  mediaUrl: string | null;
  aiSummary: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
