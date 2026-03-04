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
import { FileText, Loader2, Eye, Trash2 } from "lucide-react";
import { getStatusColor, formatDate, cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import type { GeneratedVideoBrief } from "@/lib/types";

export function GeneratedVideoBriefsTable() {
  const [briefs, setBriefs] = useState<GeneratedVideoBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GeneratedVideoBrief | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch("/api/video-briefs/generated")
      .then((r) => r.json())
      .then((data) => { setBriefs(data); setSelectedIds(new Set()); })
      .catch(() => setError("Failed to load generated briefs"))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (brief: GeneratedVideoBrief) => {
    setSelected(brief);
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
    if (selectedIds.size === briefs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(briefs.map((b) => b.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError(null);
    const ids = Array.from(selectedIds);
    const failed: string[] = [];
    for (const id of ids) {
      try {
        const res = await fetch(`/api/video-briefs/generated/${id}`, { method: "DELETE" });
        if (!res.ok) failed.push(id);
      } catch {
        failed.push(id);
      }
    }
    const deletedIds = ids.filter((id) => !failed.includes(id));
    setBriefs((prev) => prev.filter((b) => !deletedIds.includes(b.id)));
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
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Generated Video Briefs</CardTitle>
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

          {briefs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No video briefs generated yet. Submit a brief to get started.
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
                        checked={selectedIds.size === briefs.length && briefs.length > 0}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-gray-300 accent-cyan-600"
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
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {briefs.map((brief) => {
                    const status = getStatusColor(brief.status || "draft");
                    return (
                      <tr
                        key={brief.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/50",
                          selectedIds.has(brief.id) && "bg-primary/5 dark:bg-primary/5"
                        )}
                        onClick={() => openDetail(brief)}
                      >
                        <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(brief.id)}
                            onChange={() => toggleSelect(brief.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-cyan-600"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-[250px] truncate">
                          {brief.briefTitle || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {brief.contentType || "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {brief.platform || "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {brief.duration || "\u2014"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {(brief.status || "draft").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(brief.createdAt)}
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

      {/* Brief Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.briefTitle || "Video Brief Detail"}</DialogTitle>
            <DialogDescription>
              {selected?.contentType && `${selected.contentType}`}
              {selected?.platform && ` \u00b7 ${selected.platform}`}
              {selected?.duration && ` \u00b7 ${selected.duration}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {selected.strategicHypothesis && (
                <Section title="Strategic Hypothesis" content={selected.strategicHypothesis} />
              )}
              {selected.psychologyAngle && (
                <Section title="Psychology Angle" content={selected.psychologyAngle} />
              )}
              {selected.primaryHook && (
                <Section title="Primary Hook" content={selected.primaryHook} />
              )}
              {selected.hookVariationsText && (
                <Section title="Hook Variations" content={selected.hookVariationsText} />
              )}
              {selected.shotList && (
                <Section title="Shot List" content={selected.shotList} />
              )}
              {selected.bRollRequirements && (
                <Section title="B-Roll Requirements" content={selected.bRollRequirements} />
              )}
              {selected.talentNotes && (
                <Section title="Talent Notes" content={selected.talentNotes} />
              )}
              {selected.locationRequirements && (
                <Section title="Location Requirements" content={selected.locationRequirements} />
              )}
              {selected.propsList && (
                <Section title="Props List" content={selected.propsList} />
              )}
              {selected.musicDirection && (
                <Section title="Music Direction" content={selected.musicDirection} />
              )}
              {selected.soundDesign && (
                <Section title="Sound Design" content={selected.soundDesign} />
              )}
              {selected.onScreenText && (
                <Section title="On-Screen Text" content={selected.onScreenText} />
              )}
              {selected.visualDirection && (
                <Section title="Visual Direction" content={selected.visualDirection} />
              )}
              {selected.complianceReview && (
                <Section title="Compliance Review" content={selected.complianceReview} />
              )}
              {selected.brandVoiceLock && (
                <Section title="Brand Voice Lock" content={selected.brandVoiceLock} />
              )}
              {selected.productionNotes && (
                <Section title="Production Notes" content={selected.productionNotes} />
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
        resourceName="video brief"
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
