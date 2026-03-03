"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function ScriptReviewActions({ scriptId }: { scriptId: string }) {
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitReview(reviewStatus: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/scripts/${scriptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewStatus,
          reviewNotes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setLoading(false);
    }
  }

  function handleAction(action: string) {
    if (action === "revision_needed" || action === "rejected") {
      setPendingAction(action);
      setShowNotes(true);
    } else {
      submitReview(action);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Review Actions</h3>

      {showNotes ? (
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add review notes..."
            rows={3}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowNotes(false);
                setPendingAction(null);
                setNotes("");
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => pendingAction && submitReview(pendingAction)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAction("approved")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </button>
          <button
            onClick={() => handleAction("revision_needed")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Request Revisions
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
