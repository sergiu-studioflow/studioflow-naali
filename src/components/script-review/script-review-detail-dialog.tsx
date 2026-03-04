"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ScriptReview } from "@/lib/types";

interface ScriptReviewDetailDialogProps {
  review: ScriptReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const complianceStyleMap: Record<string, string> = {
  compliant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "non-compliant": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  non_compliant: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  needs_minor_fixes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "needs minor fixes": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function getComplianceStyle(status: string): string {
  return complianceStyleMap[status.toLowerCase().replace(/ /g, "-")] ||
    complianceStyleMap[status.toLowerCase().replace(/ /g, "_")] ||
    complianceStyleMap[status.toLowerCase()] ||
    "bg-secondary text-secondary-foreground";
}

export function ScriptReviewDetailDialog({
  review,
  open,
  onOpenChange,
}: ScriptReviewDetailDialogProps) {
  if (!review) return null;

  const status = review.reviewStatus || "pending";
  const source = review.sourceType || "manual";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{review.scriptTitle}</DialogTitle>
          <DialogDescription>
            Script Review Detail
            {review.product && ` \u00b7 ${review.product}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Submitted Fields */}
          <Section title="Script Title">
            <p className="text-sm text-secondary-foreground">{review.scriptTitle}</p>
          </Section>

          <Section title="Script Text">
            <div className="max-h-64 overflow-y-auto rounded-lg bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm text-secondary-foreground font-mono">
                {review.scriptText}
              </pre>
            </div>
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Section title="Agency Awareness Level">
              <p className="text-sm text-secondary-foreground">
                {review.agencyAwarenessLevel != null
                  ? review.agencyAwarenessLevel
                  : "\u2014"}
              </p>
            </Section>
            <Section title="Product">
              <p className="text-sm text-secondary-foreground">
                {review.product || "\u2014"}
              </p>
            </Section>
            <Section title="Target Persona">
              <p className="text-sm text-secondary-foreground">
                {review.targetPersona || "\u2014"}
              </p>
            </Section>
          </div>

          <Section title="Source">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                source === "auto"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {source}
            </span>
          </Section>

          {/* AI Review Results (only when review is complete) */}
          {(status === "review_complete" || status === "completed") && (
            <>
              <div className="border-t border-border pt-5">
                <h3 className="mb-4 text-base font-semibold text-foreground">
                  AI Review Results
                </h3>
              </div>

              {/* AI Awareness Level + Mismatch */}
              <Section title="AI Awareness Level">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-secondary-foreground">
                    {review.aiAwarenessLevel != null
                      ? review.aiAwarenessLevel
                      : "\u2014"}
                  </p>
                  {review.awarenessMismatch && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      MISMATCH: Agency said {review.agencyAwarenessLevel}, AI detected{" "}
                      {review.aiAwarenessLevel}
                    </span>
                  )}
                </div>
              </Section>

              {/* Awareness Analysis */}
              {review.awarenessAnalysis && (
                <Section title="Awareness Analysis">
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {review.awarenessAnalysis}
                  </div>
                </Section>
              )}

              {/* Compliance Status */}
              {review.complianceStatus && (
                <Section title="Compliance Status">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      getComplianceStyle(review.complianceStatus)
                    )}
                  >
                    {review.complianceStatus}
                  </span>
                </Section>
              )}

              {/* Compliance Issues */}
              {review.complianceIssues && (
                <Section title="Compliance Issues">
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {review.complianceIssues}
                  </div>
                </Section>
              )}

              {/* Corrected Script */}
              {review.correctedScript && (
                <Section title="Corrected Script">
                  <div className="max-h-64 overflow-y-auto rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <pre className="whitespace-pre-wrap text-sm text-secondary-foreground font-mono">
                      {review.correctedScript}
                    </pre>
                  </div>
                </Section>
              )}

              {/* Changes Summary */}
              {review.changesSummary && (
                <Section title="Changes Summary">
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {review.changesSummary}
                  </div>
                </Section>
              )}

              {/* Brand Voice Alignment */}
              {review.brandVoiceAlignment && (
                <Section title="Brand Voice Alignment">
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {review.brandVoiceAlignment}
                  </div>
                </Section>
              )}

              {/* Overall Score */}
              {review.overallScore != null && (
                <Section title="Overall Score">
                  <p className="text-2xl font-bold text-foreground">
                    {review.overallScore}
                    <span className="text-base font-normal text-muted-foreground">
                      /5
                    </span>
                  </p>
                </Section>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-medium text-foreground">{title}</h4>
      {children}
    </div>
  );
}
