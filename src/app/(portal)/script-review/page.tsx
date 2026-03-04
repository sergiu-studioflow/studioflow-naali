import { ScriptReviewTabs } from "@/components/script-review/script-review-tabs";

export const dynamic = "force-dynamic";

export default function ScriptReviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Script Review
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Submit scripts for AI-powered compliance review, awareness analysis, and correction.
        </p>
      </div>

      <ScriptReviewTabs />
    </div>
  );
}
