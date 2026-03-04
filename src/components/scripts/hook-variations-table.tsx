"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Loader2, Eye, Trash2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

interface HookWithScript {
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
  scriptTitle: string | null;
}

const stopRateColor: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300" },
  Medium: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  Low: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
};

export function HookVariationsTable() {
  const [hooks, setHooks] = useState<HookWithScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HookWithScript | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hooks")
      .then((r) => r.json())
      .then((data) => { setHooks(data); setSelectedIds(new Set()); })
      .catch(() => setError("Failed to load hook variations"))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (hook: HookWithScript) => {
    setSelected(hook);
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
    if (selectedIds.size === hooks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(hooks.map((h) => h.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError(null);
    const ids = Array.from(selectedIds);
    const failed: string[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/hooks/${id}`, { method: "DELETE" });
        if (!res.ok) failed.push(id);
      } catch {
        failed.push(id);
      }
    }
    const deletedIds = ids.filter((id) => !failed.includes(id));
    setHooks((prev) => prev.filter((h) => !deletedIds.includes(h.id)));
    setSelectedIds(new Set(failed));
    if (failed.length > 0) setError(`Failed to delete ${failed.length} item(s)`);
    setDeleting(false);
    setConfirmOpen(false);
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Hook Variations</CardTitle>
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

          {hooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Zap className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No hook variations yet. They are generated alongside scripts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === hooks.length && hooks.length > 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-gray-300 accent-orange-600"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Hook Title
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Script
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Stop Rate
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hooks.map((hook) => {
                    const rate = stopRateColor[hook.estimatedStopRate || ""] || {
                      bg: "bg-gray-50 dark:bg-gray-900",
                      text: "text-muted-foreground",
                    };
                    return (
                      <tr
                        key={hook.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          selectedIds.has(hook.id) && "bg-primary/5 dark:bg-primary/5"
                        )}
                        onClick={() => openDetail(hook)}
                      >
                        <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(hook.id)}
                            onChange={() => toggleSelect(hook.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-orange-600"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                          {hook.hookTitle || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {hook.hookType || "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                          {hook.scriptTitle || "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {hook.platformBestFit || "\u2014"}
                        </td>
                        <td className="px-4 py-3">
                          {hook.estimatedStopRate ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${rate.bg} ${rate.text}`}
                            >
                              {hook.estimatedStopRate}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {formatDate(hook.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Eye className="inline h-3.5 w-3.5 text-muted-foreground" />
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

      {/* Hook Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.hookTitle || "Hook Detail"}</DialogTitle>
            <DialogDescription>
              {selected?.hookType && `${selected.hookType}`}
              {selected?.platformBestFit && ` \u00b7 Best for ${selected.platformBestFit}`}
              {selected?.estimatedStopRate && ` \u00b7 ${selected.estimatedStopRate} stop rate`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {selected.hookText && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-foreground">
                    Hook Text
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {selected.hookText}
                  </div>
                </div>
              )}
              {selected.visualDescription && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-foreground">
                    Visual Description
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {selected.visualDescription}
                  </div>
                </div>
              )}
              {selected.whyItWorks && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-foreground">
                    Why It Works
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-secondary-foreground">
                    {selected.whyItWorks}
                  </div>
                </div>
              )}
              {selected.scriptTitle && (
                <div className="text-xs text-muted-foreground">
                  From script: {selected.scriptTitle}
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
        resourceName="hook"
        loading={deleting}
      />
    </>
  );
}
