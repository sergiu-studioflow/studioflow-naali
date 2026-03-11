"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Loader2, Pencil, ChevronRight } from "lucide-react";
import { AwarenessLevelDialog } from "./awareness-level-dialog";
import type { AwarenessLevel } from "@/lib/types";

export function AwarenessLevelsSection() {
  const [levels, setLevels] = useState<AwarenessLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<AwarenessLevel | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetch("/api/awareness-levels")
      .then((res) => res.json())
      .then((data) => setLevels(data))
      .catch(() => setError("Failed to load awareness levels"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setSelectedLevel(null);
    setDialogOpen(true);
  };

  const openEdit = (level: AwarenessLevel) => {
    setSelectedLevel(level);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<AwarenessLevel>) => {
    if (selectedLevel) {
      // Update
      const res = await fetch(`/api/awareness-levels/${selectedLevel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update awareness level");
      }
      const updated = await res.json();
      setLevels((prev) =>
        prev
          .map((l) => (l.id === updated.id ? updated : l))
          .sort((a, b) => a.level - b.level)
      );
    } else {
      // Create
      const res = await fetch("/api/awareness-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create awareness level");
      }
      const created = await res.json();
      setLevels((prev) => [...prev, created].sort((a, b) => a.level - b.level));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/awareness-levels/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete awareness level");
    }
    setLevels((prev) => prev.filter((l) => l.id !== id));
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/10">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Awareness Levels</CardTitle>
            {collapsed && levels.length > 0 && (
              <span className="text-xs text-muted-foreground">{levels.length} levels</span>
            )}
          </div>
          {!collapsed && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); openCreate(); }}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Level
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
            ) : levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Layers className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No awareness levels defined yet.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Create First Level
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                        Level
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Name
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Description
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Hook Style
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Tone
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {levels.map((level) => (
                      <tr
                        key={level.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => openEdit(level)}
                      >
                        <td className="px-5 py-5">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary dark:bg-primary/10 dark:text-primary">
                            {level.level}
                          </span>
                        </td>
                        <td className="px-5 py-5 font-medium text-foreground">
                          {level.name}
                        </td>
                        <td className="px-5 py-5 text-muted-foreground hidden md:table-cell">
                          {level.description
                            ? level.description.length > 60
                              ? level.description.slice(0, 60) + "..."
                              : level.description
                            : "—"}
                        </td>
                        <td className="px-5 py-5 text-muted-foreground hidden lg:table-cell">
                          {level.hookStyle
                            ? level.hookStyle.length > 40
                              ? level.hookStyle.slice(0, 40) + "..."
                              : level.hookStyle
                            : "—"}
                        </td>
                        <td className="px-5 py-5 text-muted-foreground hidden lg:table-cell">
                          {level.tone || "—"}
                        </td>
                        <td className="px-6 py-5 text-right">
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

      <AwarenessLevelDialog
        level={selectedLevel}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
