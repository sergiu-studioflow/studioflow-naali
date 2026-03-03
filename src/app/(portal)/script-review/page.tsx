import { ClipboardCheck } from "lucide-react";

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

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium text-foreground">
          Coming soon
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Script review, compliance checking, and AI correction will be available here.
        </p>
      </div>
    </div>
  );
}
