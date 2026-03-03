"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Loader2, Pencil } from "lucide-react";
import { PersonaDialog } from "./persona-dialog";
import type { Persona } from "@/lib/types";

export function PersonasSection() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    fetch("/api/personas")
      .then((res) => res.json())
      .then((data) => setPersonas(data))
      .catch(() => setError("Failed to load personas"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setSelectedPersona(null);
    setDialogOpen(true);
  };

  const openEdit = (persona: Persona) => {
    setSelectedPersona(persona);
    setDialogOpen(true);
  };

  const handleSave = async (data: Partial<Persona>) => {
    if (selectedPersona) {
      // Update
      const res = await fetch(`/api/personas/${selectedPersona.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update persona");
      }
      const updated = await res.json();
      setPersonas((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } else {
      // Create
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create persona");
      }
      const created = await res.json();
      setPersonas((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete persona");
    }
    setPersonas((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle className="text-lg">Target Personas</CardTitle>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Persona
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {personas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-muted-foreground">
                No personas defined yet.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={openCreate}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Create First Persona
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Label
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Demographics
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Situation
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground w-16">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {personas.map((persona) => (
                    <tr
                      key={persona.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => openEdit(persona)}
                    >
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {persona.sortOrder}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {persona.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {persona.label || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {persona.demographics
                          ? persona.demographics.length > 50
                            ? persona.demographics.slice(0, 50) + "..."
                            : persona.demographics
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {persona.situation
                          ? persona.situation.length > 60
                            ? persona.situation.slice(0, 60) + "..."
                            : persona.situation
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Pencil className="inline h-3.5 w-3.5 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PersonaDialog
        persona={selectedPersona}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
