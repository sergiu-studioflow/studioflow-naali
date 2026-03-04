"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Eye, Play, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScriptReviewDetailDialog } from "./script-review-detail-dialog";
import type { ScriptReview } from "@/lib/types";

const statusStyles: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  under_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  review_complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const sourceStyles: Record<string, string> = {
  manual: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  auto: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

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
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function getScoreColor(score: number): string {
  if (score >= 4) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function ScriptReviewsTable() {
  const [reviews, setReviews] = useState<ScriptReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScriptReview | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    setError(null);
    fetch("/api/script-reviews")
      .then((r) => r.json())
      .then((data) => setReviews(data))
      .catch(() => setError("Failed to load script reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleTriggerReview = async (id: string) => {
    setTriggeringId(id);
    try {
      const res = await fetch(`/api/script-reviews/${id}/trigger`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to trigger review");
      }
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, reviewStatus: "under_review" } : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger review");
    } finally {
      setTriggeringId(null);
    }
  };

  const openDetail = (review: ScriptReview) => {
    setSelected(review);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Play className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-lg">All Script Reviews</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchReviews}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Play className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-muted-foreground">
                No scripts submitted yet. Use the Submit Script tab to add one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Script Title
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Persona
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Awareness
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Compliance
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviews.map((review) => {
                    const status = review.reviewStatus || "pending";
                    const source = review.sourceType || "manual";
                    const isComplete = status === "review_complete" || status === "completed";
                    return (
                      <tr
                        key={review.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => openDetail(review)}
                      >
                        <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                          {review.scriptTitle}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {review.product || "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[120px] truncate">
                          {review.targetPersona || "\u2014"}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {review.agencyAwarenessLevel != null || (isComplete && review.aiAwarenessLevel != null) ? (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">
                                {review.agencyAwarenessLevel ?? "\u2014"}
                              </span>
                              {isComplete && review.aiAwarenessLevel != null && (
                                <>
                                  <span className="text-muted-foreground">&rarr;</span>
                                  <span className="font-medium text-foreground">
                                    {review.aiAwarenessLevel}
                                  </span>
                                  {review.awarenessMismatch && (
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isComplete && review.complianceStatus ? (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                                getComplianceStyle(review.complianceStatus)
                              )}
                            >
                              {review.complianceStatus}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isComplete && review.overallScore != null ? (
                            <span className={cn("font-semibold", getScoreColor(review.overallScore))}>
                              {review.overallScore}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                              sourceStyles[source] || sourceStyles.manual
                            )}
                          >
                            {source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                              statusStyles[status] || statusStyles.pending
                            )}
                          >
                            {status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTriggerReview(review.id)}
                                disabled={triggeringId === review.id}
                                className="gap-1.5"
                              >
                                {triggeringId === review.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5" />
                                )}
                                Review
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetail(review)}
                              className="gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ScriptReviewDetailDialog
        review={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
