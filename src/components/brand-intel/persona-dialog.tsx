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
import type { Persona } from "@/lib/types";

interface PersonaDialogProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Persona>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PersonaDialog({
  persona,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: PersonaDialogProps) {
  const [form, setForm] = useState({
    name: "",
    label: "",
    demographics: "",
    situation: "",
    painPoints: "",
    whatTheyTried: "",
    whatTheyWant: "",
    objections: "",
    conversionTriggers: "",
    messagingNotes: "",
    complianceNote: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: persona?.name || "",
        label: persona?.label || "",
        demographics: persona?.demographics || "",
        situation: persona?.situation || "",
        painPoints: persona?.painPoints || "",
        whatTheyTried: persona?.whatTheyTried || "",
        whatTheyWant: persona?.whatTheyWant || "",
        objections: persona?.objections || "",
        conversionTriggers: persona?.conversionTriggers || "",
        messagingNotes: persona?.messagingNotes || "",
        complianceNote: persona?.complianceNote || "",
        sortOrder: persona?.sortOrder || 0,
      });
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, persona]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
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
    if (!persona?.id || !onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(persona.id);
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
          <DialogTitle>{persona ? "Edit Persona" : "New Persona"}</DialogTitle>
          <DialogDescription>
            {persona
              ? "Update the persona details below."
              : "Fill in the details to create a new persona."}
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Marie"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Label / Title
              </label>
              <Input
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="e.g. The Overwhelmed Mother"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Demographics
              </label>
              <Input
                value={form.demographics}
                onChange={(e) => update("demographics", e.target.value)}
                placeholder="e.g. 38, part-time HR, suburban Lyon"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort Order
              </label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Situation
            </label>
            <Textarea
              value={form.situation}
              onChange={(e) => update("situation", e.target.value)}
              placeholder="Describe this persona's life situation..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pain Points
            </label>
            <Textarea
              value={form.painPoints}
              onChange={(e) => update("painPoints", e.target.value)}
              placeholder="What problems does this persona face?"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              What They&apos;ve Tried
            </label>
            <Textarea
              value={form.whatTheyTried}
              onChange={(e) => update("whatTheyTried", e.target.value)}
              placeholder="What solutions have they attempted?"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              What They Want
            </label>
            <Textarea
              value={form.whatTheyWant}
              onChange={(e) => update("whatTheyWant", e.target.value)}
              placeholder="What outcome are they seeking?"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Objections
            </label>
            <Textarea
              value={form.objections}
              onChange={(e) => update("objections", e.target.value)}
              placeholder="Common objections or hesitations..."
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conversion Triggers
            </label>
            <Textarea
              value={form.conversionTriggers}
              onChange={(e) => update("conversionTriggers", e.target.value)}
              placeholder="What makes them convert?"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Messaging Notes
            </label>
            <Textarea
              value={form.messagingNotes}
              onChange={(e) => update("messagingNotes", e.target.value)}
              placeholder="Key messaging guidelines for this persona..."
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Compliance Note
            </label>
            <Textarea
              value={form.complianceNote}
              onChange={(e) => update("complianceNote", e.target.value)}
              placeholder="Any regulatory or compliance considerations..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {persona && onDelete && (
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
              {saving ? "Saving..." : persona ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
