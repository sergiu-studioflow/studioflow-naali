"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Plus, Loader2, Pencil, ChevronRight } from "lucide-react";
import { TargetObjectionDialog } from "./target-objection-dialog";
import type { TargetObjection } from "@/lib/types";

export function TargetObjectionsSection() {
  const [objections, setObjections] = useState<TargetObjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<TargetObjection | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetch("/api/target-objections")
      .then((res) => res.json())
      .then((data) => setObjections(data))
      .catch(() => setError("Failed to load target objections"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setSelectedObjection(null);
    setDialogOpen(true);
  };

  const openEdit = (objection: TargetObjection) => {
    setSelectedObjection(objection);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<TargetObjection>) => {
    if (selectedObjection) {
      // Update
      const res = await fetch(`/api/target-objections/${selectedObjection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update objection");
      }
      const updated = await res.json();
      setObjections((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    } else {
      // Create
      const res = await fetch("/api/target-objections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create objection");
      }
      const created = await res.json();
      setObjections((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/target-objections/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete objection");
    }
    setObjections((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <>
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3">
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`} />
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-lg">Target Objections</CardTitle>
            {collapsed && objections.length > 0 && (
              <span className="text-xs text-muted-foreground">{objections.length} objections</span>
            )}
          </div>
          {!collapsed && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); openCreate(); }}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Objection
            </Button>
          )}
        </CardHeader>

        {!collapsed && (
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : objections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShieldAlert className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No target objections defined yet.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Create First Objection
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {objections.map((objection) => (
                      <tr
                        key={objection.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => openEdit(objection)}
                      >
                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                          {objection.sortOrder}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {objection.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {objection.description
                            ? objection.description.length > 60
                              ? objection.description.slice(0, 60) + "..."
                              : objection.description
                            : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Pencil className="inline h-3.5 w-3.5 text-muted-foreground" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <TargetObjectionDialog
        objection={selectedObjection}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
