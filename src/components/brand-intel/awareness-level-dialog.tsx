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
import type { AwarenessLevel } from "@/lib/types";

interface AwarenessLevelDialogProps {
  level: AwarenessLevel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<AwarenessLevel>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function AwarenessLevelDialog({
  level,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: AwarenessLevelDialogProps) {
  const [form, setForm] = useState({
    level: 1,
    name: "",
    description: "",
    scriptObjective: "",
    hookStyle: "",
    creativeGuidelines: "",
    examples: "",
    tone: "",
    warning: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        level: level?.level || 1,
        name: level?.name || "",
        description: level?.description || "",
        scriptObjective: level?.scriptObjective || "",
        hookStyle: level?.hookStyle || "",
        creativeGuidelines: level?.creativeGuidelines || "",
        examples: level?.examples || "",
        tone: level?.tone || "",
        warning: level?.warning || "",
      });
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, level]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (form.level < 1) {
      setError("Level must be at least 1");
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
    if (!level?.id || !onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(level.id);
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
          <DialogTitle>
            {level ? "Edit Awareness Level" : "New Awareness Level"}
          </DialogTitle>
          <DialogDescription>
            {level
              ? "Update the awareness level details below."
              : "Fill in the details to create a new awareness level."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Level # *
              </label>
              <Input
                type="number"
                min={1}
                value={form.level}
                onChange={(e) => update("level", parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Problem Aware"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tone
            </label>
            <Input
              value={form.tone}
              onChange={(e) => update("tone", e.target.value)}
              placeholder="e.g. Empathetic, validating"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what characterizes this awareness level..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Script Objective
            </label>
            <Textarea
              value={form.scriptObjective}
              onChange={(e) => update("scriptObjective", e.target.value)}
              placeholder="What should scripts at this level aim to achieve?"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hook Style
            </label>
            <Textarea
              value={form.hookStyle}
              onChange={(e) => update("hookStyle", e.target.value)}
              placeholder="What hook approaches work at this level?"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Creative Guidelines
            </label>
            <Textarea
              value={form.creativeGuidelines}
              onChange={(e) => update("creativeGuidelines", e.target.value)}
              placeholder="Creative direction and guidelines..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Examples
            </label>
            <Textarea
              value={form.examples}
              onChange={(e) => update("examples", e.target.value)}
              placeholder="Example hooks, phrases, or approaches..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Warning / Pitfalls
            </label>
            <Textarea
              value={form.warning}
              onChange={(e) => update("warning", e.target.value)}
              placeholder="What to avoid at this awareness level..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {level && onDelete && (
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
              {saving ? "Saving..." : level ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
