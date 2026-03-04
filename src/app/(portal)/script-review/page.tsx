import { ScriptReviewTabs } from "@/components/script-review/script-review-tabs";

export const dynamic = "force-dynamic";

export default function ScriptReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Script Review & Correction
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit scripts for AI-powered compliance review, awareness analysis, and correction.
        </p>
      </div>

      <ScriptReviewTabs />
    </div>
  );
}
