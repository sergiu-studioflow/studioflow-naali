"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Loader2, Eye, Zap, ChevronDown, Trash2 } from "lucide-react";
import { getStatusColor, formatDate, cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { ScriptWithHooks } from "@/lib/types";

const reviewStatuses = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "in_production", label: "In Production" },
  { value: "rejected", label: "Declined" },
] as const;

const stopRateColor: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300" },
  Medium: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  Low: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
};

export function GeneratedScriptsTable() {
  const [scripts, setScripts] = useState<ScriptWithHooks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScriptWithHooks | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then((data) => { setScripts(data); setSelectedIds(new Set()); })
      .catch(() => setError("Failed to load scripts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!statusDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [statusDropdown]);

  const openDetail = (script: ScriptWithHooks) => {
    setSelected(script);
    setDialogOpen(true);
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
    if (selectedIds.size === scripts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scripts.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError(null);
    const ids = Array.from(selectedIds);
    const failed: string[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
        if (!res.ok) failed.push(id);
      } catch {
        failed.push(id);
      }
    }
    const deletedIds = ids.filter((id) => !failed.includes(id));
    setScripts((prev) => prev.filter((s) => !deletedIds.includes(s.id)));
    setSelectedIds(new Set(failed));
    if (failed.length > 0) setError(`Failed to delete ${failed.length} item(s)`);
    setDeleting(false);
    setConfirmOpen(false);
  };

  const updateStatus = async (scriptId: string, newStatus: string) => {
    setStatusDropdown(null);
    const prev = scripts.map((s) => ({ ...s }));
    setScripts((curr) =>
      curr.map((s) => (s.id === scriptId ? { ...s, reviewStatus: newStatus } : s))
    );
    try {
      const res = await fetch(`/api/scripts/${scriptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setScripts(prev);
    }
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Generated Scripts</CardTitle>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {scripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-muted-foreground">
                No scripts generated yet. Submit a brief to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === scripts.length && scripts.length > 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Content Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Review Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Hooks
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scripts.map((script) => {
                    const status = getStatusColor(script.reviewStatus || "draft");
                    return (
                      <tr
                        key={script.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          selectedIds.has(script.id) && "bg-emerald-50 dark:bg-emerald-900/10"
                        )}
                        onClick={() => openDetail(script)}
                      >
                        <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(script.id)}
                            onChange={() => toggleSelect(script.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-[250px] truncate">
                          {script.scriptTitle || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {script.contentType || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {script.platform || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {script.duration || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative" ref={statusDropdown === script.id ? dropdownRef : undefined}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusDropdown(statusDropdown === script.id ? null : script.id);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${status.bg} ${status.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              {reviewStatuses.find((r) => r.value === (script.reviewStatus || "draft"))?.label || (script.reviewStatus || "draft").replace(/_/g, " ")}
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            {statusDropdown === script.id && (
                              <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-background py-1 shadow-lg">
                                {reviewStatuses.map((rs) => {
                                  const rsColor = getStatusColor(rs.value);
                                  const isActive = (script.reviewStatus || "draft") === rs.value;
                                  return (
                                    <button
                                      key={rs.value}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isActive) updateStatus(script.id, rs.value);
                                        else setStatusDropdown(null);
                                      }}
                                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-muted ${isActive ? "font-medium" : ""}`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${rsColor.dot}`} />
                                      <span className={rsColor.text}>{rs.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {script.hookVariations.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                              <Zap className="h-3 w-3" />
                              {script.hookVariations.length}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(script.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Eye className="inline h-3.5 w-3.5 text-gray-400" />
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

      {/* Script Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.scriptTitle || "Script Detail"}</DialogTitle>
            <DialogDescription>
              {selected?.contentType && `${selected.contentType}`}
              {selected?.platform && ` · ${selected.platform}`}
              {selected?.duration && ` · ${selected.duration}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {selected.fullScript && (
                <Section title="Full Script" content={selected.fullScript} />
              )}
              {selected.dialogue && (
                <Section title="Dialogue" content={selected.dialogue} />
              )}
              {selected.sceneBreakdown && (
                <Section title="Scene Breakdown" content={selected.sceneBreakdown} />
              )}
              {selected.visualDirection && (
                <Section title="Visual Direction" content={selected.visualDirection} />
              )}
              {selected.audioDirection && (
                <Section title="Audio Direction" content={selected.audioDirection} />
              )}
              {selected.onScreenText && (
                <Section title="On-Screen Text" content={selected.onScreenText} />
              )}
              {selected.emotionalArc && (
                <Section title="Emotional Arc" content={selected.emotionalArc} />
              )}
              {selected.complianceReview && (
                <Section title="Compliance Review" content={selected.complianceReview} />
              )}
              {selected.reviewNotes && (
                <Section title="Review Notes" content={selected.reviewNotes} />
              )}

              {selected.hookVariations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <h4 className="text-sm font-medium text-foreground">
                      Hook Variations ({selected.hookVariations.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {selected.hookVariations.map((hook) => {
                      const rate = stopRateColor[hook.estimatedStopRate || ""] || {
                        bg: "bg-gray-50 dark:bg-gray-900",
                        text: "text-gray-600 dark:text-gray-400",
                      };
                      return (
                        <div
                          key={hook.id}
                          className="rounded-lg border border-border p-4 space-y-2"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {hook.hookTitle || "Untitled Hook"}
                            </span>
                            {hook.hookType && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                {hook.hookType}
                              </span>
                            )}
                            {hook.estimatedStopRate && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${rate.bg} ${rate.text}`}
                              >
                                {hook.estimatedStopRate}
                              </span>
                            )}
                            {hook.platformBestFit && (
                              <span className="text-xs text-muted-foreground">
                                {hook.platformBestFit}
                              </span>
                            )}
                          </div>
                          {hook.hookText && (
                            <div className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-secondary-foreground">
                              {hook.hookText}
                            </div>
                          )}
                          {hook.visualDescription && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Visual:</span> {hook.visualDescription}
                            </div>
                          )}
                          {hook.whyItWorks && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Why it works:</span> {hook.whyItWorks}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleBulkDelete}
        count={selectedIds.size}
        resourceName="script"
        loading={deleting}
      />
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-medium text-foreground">
        {title}
      </h4>
      <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
        {content}
      </div>
    </div>
  );
}
