"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { MinedAngle, Persona } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "new", label: "New", icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", icon: XCircle },
];

function truncate(text: string | null, max = 100) {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export function AngleMiningPanel() {
  const [angles, setAngles] = useState<MinedAngle[]>([]);
  const [runs, setRuns] = useState<string[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [miningSuccess, setMiningSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [personaFilter, setPersonaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [runFilter, setRunFilter] = useState("");

  // Detail dialog
  const [selectedAngle, setSelectedAngle] = useState<MinedAngle | null>(null);

  // Load personas from Brand Intelligence
  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => setPersonas(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchAngles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (personaFilter) params.set("targetPersona", personaFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (runFilter) params.set("miningRunId", runFilter);

      const res = await fetch(`/api/feedback/angles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAngles(data.angles);
        setRuns(data.runs);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [personaFilter, statusFilter, runFilter]);

  useEffect(() => {
    fetchAngles();
  }, [fetchAngles]);

  async function triggerMining() {
    setMining(true);
    setError(null);
    setMiningSuccess(null);

    try {
      const res = await fetch("/api/feedback/angles/trigger", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to trigger mining");
      }
      const data = await res.json();
      setMiningSuccess(
        `Mining triggered (${data.miningRunId}). Results will appear here when complete.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger mining");
    } finally {
      setMining(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/feedback/angles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAngles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
        if (selectedAngle?.id === id) {
          setSelectedAngle({ ...selectedAngle, status });
        }
      }
    } catch {
      // silent
    }
  }

  const confidenceColor = (c: string | null) => {
    if (c === "high") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (c === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-muted text-muted-foreground";
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  return (
    <>
      <div className="space-y-6">
        {/* Trigger Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  AI Angle Mining
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analyze customer reviews to discover new advertising angles,
                  persona insights, and creative directions.
                </p>
              </div>
              <Button
                onClick={triggerMining}
                disabled={mining}
                className="gap-2"
              >
                {mining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Extract Angles & Personas
              </Button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}
            {miningSuccess && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                {miningSuccess}
              </div>
            )}

            {/* Stats */}
            {angles.length > 0 && (
              <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
                <span>{angles.length} angles total</span>
                <span>{runs.length} mining runs</span>
                <span>
                  {angles.filter((a) => a.status === "approved").length} approved
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters + Table */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap gap-3">
              <Select value={personaFilter} onValueChange={(v) => setPersonaFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="All personas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All personas</SelectItem>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {runs.length > 1 && (
                <Select value={runFilter} onValueChange={(v) => setRunFilter(v === "all" ? "" : v)}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="All runs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All runs</SelectItem>
                    {runs.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace("run-", "Run ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : angles.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No angles mined yet. Click "Extract Angles & Personas" to start.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 pr-3 font-medium">Angle</th>
                      <th className="pb-3 pr-3 font-medium">Persona</th>
                      <th className="pb-3 pr-3 font-medium">Awareness</th>
                      <th className="pb-3 pr-3 font-medium">Key Insight</th>
                      <th className="pb-3 pr-3 font-medium">Confidence</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {angles.map((angle) => (
                      <tr
                        key={angle.id}
                        className="cursor-pointer border-b transition-colors hover:bg-muted/50 last:border-0"
                        onClick={() => setSelectedAngle(angle)}
                      >
                        <td className="py-3 pr-3 font-medium">
                          {angle.angleName}
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {angle.targetPersona || "-"}
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          {angle.awarenessLevel || "-"}
                        </td>
                        <td className="py-3 pr-3 max-w-[300px]">
                          {truncate(angle.keyInsight)}
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColor(angle.confidence)}`}>
                            {angle.confidence || "unknown"}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(angle.status)}`}>
                            {angle.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Angle Detail Dialog */}
      <Dialog open={!!selectedAngle} onOpenChange={() => setSelectedAngle(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAngle?.angleName}</DialogTitle>
          </DialogHeader>
          {selectedAngle && (
            <div className="space-y-5">
              {/* Status actions */}
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Button
                      key={opt.value}
                      variant={selectedAngle.status === opt.value ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => updateStatus(selectedAngle.id, opt.value)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAngle.targetPersona && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {selectedAngle.targetPersona}
                  </span>
                )}
                {selectedAngle.awarenessLevel && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    Level {selectedAngle.awarenessLevel}
                  </span>
                )}
                {selectedAngle.suggestedAngleType && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {selectedAngle.suggestedAngleType}
                  </span>
                )}
                {selectedAngle.confidence && (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceColor(selectedAngle.confidence)}`}>
                    {selectedAngle.confidence} confidence
                  </span>
                )}
              </div>

              {[
                { label: "Key Insight", value: selectedAngle.keyInsight },
                { label: "Pain Point Cluster", value: selectedAngle.painPointCluster },
                { label: "Emotional Trigger", value: selectedAngle.emotionalTrigger },
                { label: "Suggested Hook Direction", value: selectedAngle.suggestedHookDirection },
                { label: "Compliance Notes", value: selectedAngle.complianceNotes },
              ]
                .filter((f) => f.value)
                .map((field) => (
                  <div key={field.label}>
                    <p className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm">
                      {field.value}
                    </p>
                  </div>
                ))}

              {selectedAngle.supportingQuotes && Array.isArray(selectedAngle.supportingQuotes) && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Supporting Quotes
                  </p>
                  <div className="mt-2 space-y-2">
                    {selectedAngle.supportingQuotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground"
                      >
                        &ldquo;{q.quote}&rdquo;
                        {q.sourceType && (
                          <span className="ml-2 text-xs not-italic">
                            ({q.sourceType})
                          </span>
                        )}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {selectedAngle.reviewsAnalyzed && (
                <p className="text-xs text-muted-foreground">
                  Based on analysis of {selectedAngle.reviewsAnalyzed} reviews
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
