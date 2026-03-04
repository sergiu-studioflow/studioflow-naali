"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Loader2, Pencil, ChevronRight } from "lucide-react";
import { MotivatorDialog } from "./motivator-dialog";
import type { Motivator } from "@/lib/types";

export function MotivatorsSection() {
  const [motivators, setMotivators] = useState<Motivator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMotivator, setSelectedMotivator] = useState<Motivator | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetch("/api/motivators")
      .then((res) => res.json())
      .then((data) => setMotivators(data))
      .catch(() => setError("Failed to load motivators"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, Motivator[]> = {};
    for (const m of motivators) {
      const key = m.mainAngle;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }, [motivators]);

  const openCreate = () => {
    setSelectedMotivator(null);
    setDialogOpen(true);
  };

  const openEdit = (motivator: Motivator) => {
    setSelectedMotivator(motivator);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<Motivator>) => {
    if (selectedMotivator) {
      // Update
      const res = await fetch(`/api/motivators/${selectedMotivator.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update motivator");
      }
      const updated = await res.json();
      setMotivators((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } else {
      // Create
      const res = await fetch("/api/motivators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create motivator");
      }
      const created = await res.json();
      setMotivators((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/motivators/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete motivator");
    }
    setMotivators((prev) => prev.filter((m) => m.id !== id));
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
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Motivators</CardTitle>
            {collapsed && motivators.length > 0 && (
              <span className="text-xs text-muted-foreground">{motivators.length} motivators</span>
            )}
          </div>
          {!collapsed && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); openCreate(); }}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Motivator
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
            ) : motivators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Zap className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No motivators defined yet.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Create First Motivator
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Sub-Angle
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                        Emotional Tone
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                        Core Motivation
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(grouped).map(([mainAngle, items]) => {
                      const first = items[0];
                      return (
                        <Fragment key={mainAngle}>
                          <tr className="bg-muted/30">
                            <td colSpan={5} className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {mainAngle}
                                </span>
                                {first.mainAngleEstimatedShare && (
                                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/10 dark:text-primary">
                                    {first.mainAngleEstimatedShare}
                                  </span>
                                )}
                                {first.mainAngleDescription && (
                                  <span className="text-xs text-muted-foreground">
                                    {first.mainAngleDescription}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                          {items.map((motivator) => (
                            <tr
                              key={motivator.id}
                              className="cursor-pointer transition-colors hover:bg-muted/50"
                              onClick={() => openEdit(motivator)}
                            >
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                                  {motivator.code}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground">
                                {motivator.subAngle}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                {motivator.emotionalTone || "\u2014"}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                                {motivator.coreMotivation
                                  ? motivator.coreMotivation.length > 60
                                    ? motivator.coreMotivation.slice(0, 60) + "..."
                                    : motivator.coreMotivation
                                  : "\u2014"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Pencil className="inline h-3.5 w-3.5 text-muted-foreground" />
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <MotivatorDialog
        motivator={selectedMotivator}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
