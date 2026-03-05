"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Eye, Play, AlertTriangle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScriptReviewDetailDialog } from "./script-review-detail-dialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { ScriptReview } from "@/lib/types";

const statusStyles: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  under_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  review_complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const sourceStyles: Record<string, string> = {
  manual: "bg-secondary text-secondary-foreground",
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
    "bg-secondary text-secondary-foreground";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    setError(null);
    fetch("/api/script-reviews")
      .then((r) => r.json())
      .then((data) => { setReviews(data); setSelectedIds(new Set()); })
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError(null);
    const ids = Array.from(selectedIds);
    const failed: string[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/script-reviews/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          failed.push(data.error || id);
        }
      } catch {
        failed.push(id);
      }
    }
    const deletedIds = ids.filter((id) => !failed.includes(id));
    setReviews((prev) => prev.filter((r) => !deletedIds.includes(r.id)));
    setSelectedIds(new Set(failed.filter((f) => ids.includes(f))));
    if (failed.length > 0) {
      setError(`Failed to delete ${failed.length} item(s)`);
    }
    setDeleting(false);
    setConfirmOpen(false);
  };

  const openDetail = (review: ScriptReview) => {
    setSelected(review);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">All Script Reviews</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete ({selectedIds.size})
                </Button>
              )}
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
              <Play className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No scripts submitted yet. Use the Submit Script tab to add one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/70">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === reviews.length && reviews.length > 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                      />
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground">
                      Script Title
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground hidden md:table-cell">
                      Persona
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground hidden md:table-cell">
                      Awareness
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground">
                      Compliance
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground">
                      Score
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground hidden md:table-cell">
                      Source
                    </th>
                    <th className="px-4 py-3.5 text-left text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-right text-muted-foreground">
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
                        className={cn(
                          "cursor-pointer transition-colors duration-150 hover:bg-accent/60 dark:hover:bg-white/[0.03]",
                          selectedIds.has(review.id) && "bg-primary/5 dark:bg-primary/5"
                        )}
                        onClick={() => openDetail(review)}
                      >
                        <td className="w-10 px-3 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(review.id)}
                            onChange={() => toggleSelect(review.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-violet-600"
                          />
                        </td>
                        <td className="px-4 py-4 font-semibold text-foreground max-w-[200px] truncate">
                          {review.scriptTitle}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {review.product || "\u2014"}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground hidden md:table-cell max-w-[120px] truncate">
                          {review.targetPersona || "\u2014"}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
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
                        <td className="px-4 py-4">
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
                        <td className="px-4 py-4">
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
                        <td className="px-4 py-4">
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

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleBulkDelete}
        count={selectedIds.size}
        resourceName="script review"
        loading={deleting}
      />
    </>
  );
}
