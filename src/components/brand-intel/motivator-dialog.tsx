"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import type { Motivator } from "@/lib/types";

interface MotivatorDialogProps {
  motivator: Motivator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Motivator>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function MotivatorDialog({
  motivator,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: MotivatorDialogProps) {
  const [form, setForm] = useState({
    code: "",
    sortOrder: 0,
    mainAngle: "",
    mainAngleEstimatedShare: "",
    mainAngleDescription: "",
    subAngle: "",
    painPointRelief: "",
    coreMotivation: "",
    typicalTriggers: "",
    representativeQuotes: "",
    emotionalTone: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        code: motivator?.code || "",
        sortOrder: motivator?.sortOrder || 0,
        mainAngle: motivator?.mainAngle || "",
        mainAngleEstimatedShare: motivator?.mainAngleEstimatedShare || "",
        mainAngleDescription: motivator?.mainAngleDescription || "",
        subAngle: motivator?.subAngle || "",
        painPointRelief: motivator?.painPointRelief || "",
        coreMotivation: motivator?.coreMotivation || "",
        typicalTriggers: motivator?.typicalTriggers || "",
        representativeQuotes: motivator?.representativeQuotes || "",
        emotionalTone: motivator?.emotionalTone || "",
      });
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, motivator]);

  const handleSave = async () => {
    if (!form.code.trim()) {
      setError("Code is required");
      return;
    }
    if (!form.mainAngle.trim()) {
      setError("Main Angle is required");
      return;
    }
    if (!form.subAngle.trim()) {
      setError("Sub-Angle Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!motivator?.id || !onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(motivator.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{motivator ? "Edit Motivator" : "New Motivator"}</DialogTitle>
          <DialogDescription>
            {motivator
              ? "Update the motivator details below."
              : "Fill in the details to create a new motivator."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Code *
              </label>
              <Input
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="e.g. 1A"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Sort Order
              </label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Main Angle *
              </label>
              <Input
                value={form.mainAngle}
                onChange={(e) => update("mainAngle", e.target.value)}
                placeholder="e.g. fast sleep start"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Estimated Share
              </label>
              <Input
                value={form.mainAngleEstimatedShare}
                onChange={(e) => update("mainAngleEstimatedShare", e.target.value)}
                placeholder="e.g. ~40-45%"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Main Angle Description
            </label>
            <Textarea
              value={form.mainAngleDescription}
              onChange={(e) => update("mainAngleDescription", e.target.value)}
              placeholder="Describe the main angle..."
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Sub-Angle Name *
            </label>
            <Input
              value={form.subAngle}
              onChange={(e) => update("subAngle", e.target.value)}
              placeholder="e.g. the racing-mind parent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Pain Point → Relief
            </label>
            <Textarea
              value={form.painPointRelief}
              onChange={(e) => update("painPointRelief", e.target.value)}
              placeholder="Describe the pain point and how it is relieved..."
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Core Motivation
            </label>
            <Input
              value={form.coreMotivation}
              onChange={(e) => update("coreMotivation", e.target.value)}
              placeholder="What drives this motivator?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Typical Triggers
            </label>
            <Input
              value={form.typicalTriggers}
              onChange={(e) => update("typicalTriggers", e.target.value)}
              placeholder="What triggers this motivation?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Representative Quotes
            </label>
            <Input
              value={form.representativeQuotes}
              onChange={(e) => update("representativeQuotes", e.target.value)}
              placeholder="Quotes that represent this motivator..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Emotional Tone
            </label>
            <Input
              value={form.emotionalTone}
              onChange={(e) => update("emotionalTone", e.target.value)}
              placeholder="e.g. hopeful, frustrated, anxious"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {motivator && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 dark:text-red-400">Delete?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, delete"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : null}
              {saving ? "Saving..." : motivator ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
