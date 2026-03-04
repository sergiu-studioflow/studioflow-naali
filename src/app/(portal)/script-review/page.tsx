import { ScriptReviewTabs } from "@/components/script-review/script-review-tabs";

export const dynamic = "force-dynamic";

export default function ScriptReviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Script Review
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Submit scripts for AI-powered compliance review, awareness analysis, and correction.
        </p>
      </div>

      <ScriptReviewTabs />
    </div>
  );
}
