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
import type { Product } from "@/lib/types";

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Product>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ProductDialogProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        name: product?.name || "",
        description: product?.description || "",
        sortOrder: product?.sortOrder || 0,
      });
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, product]);

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
    if (!product?.id || !onDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete(product.id);
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
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update the product details below."
              : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Premium Subscription"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe this product..."
              rows={2}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Sort Order
            </label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {product && onDelete && (
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
              {saving ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
