"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, CheckSquare, Square, X, Plus } from "lucide-react";
import type { Persona, AwarenessLevel, AppConfig } from "@/lib/types";

export function ScriptForm() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [levels, setLevels] = useState<AwarenessLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    briefName: "",
    contentType: "",
    targetObjection: "",
    personaId: "",
    awarenessLevelId: "",
    scenarioDescription: "",
    angleDirection: "",
    platform: "",
    duration: "",
    language: "",
    toneOverride: "",
    notes: "",
    generateScript: false,
  });

  const [proofAssets, setProofAssets] = useState<string[]>([]);
  const [newAsset, setNewAsset] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch("/api/personas").then((r) => r.json()),
      fetch("/api/awareness-levels").then((r) => r.json()),
    ])
      .then(([cfg, p, l]) => {
        setConfig(cfg);
        setPersonas(p);
        setLevels(l);
      })
      .catch(() => setError("Failed to load form options"))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addAsset = () => {
    if (newAsset.trim()) {
      setProofAssets((prev) => [...prev, newAsset.trim()]);
      setNewAsset("");
    }
  };

  const removeAsset = (index: number) => {
    setProofAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.briefName.trim()) {
      setError("Brief Name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Create the brief
      const briefPayload: Record<string, unknown> = {
        briefName: form.briefName,
      };
      if (form.contentType) briefPayload.contentType = form.contentType;
      if (form.targetObjection) briefPayload.targetObjection = form.targetObjection;
      if (form.personaId) briefPayload.personaId = form.personaId;
      if (form.awarenessLevelId) briefPayload.awarenessLevelId = form.awarenessLevelId;
      if (form.scenarioDescription) briefPayload.scenarioDescription = form.scenarioDescription;
      if (form.angleDirection) briefPayload.angleDirection = form.angleDirection;
      if (form.platform) briefPayload.platform = form.platform;
      if (form.duration) briefPayload.duration = form.duration;
      if (form.language) briefPayload.language = form.language;
      if (form.toneOverride) briefPayload.toneOverride = form.toneOverride;
      if (form.notes) briefPayload.notes = form.notes;
      if (proofAssets.length > 0) briefPayload.proofAssets = proofAssets;

      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefPayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create brief");
      }

      const brief = await res.json();

      // 2. Trigger generation if checkbox is checked
      if (form.generateScript) {
        const triggerRes = await fetch(`/api/briefs/${brief.id}/trigger`, {
          method: "POST",
        });
        if (!triggerRes.ok) {
          const data = await triggerRes.json().catch(() => ({}));
          throw new Error(data.error || "Brief created but failed to trigger generation");
        }
      }

      setSuccess(true);
      // Reset form
      setForm({
        briefName: "",
        contentType: "",
        targetObjection: "",
        personaId: "",
        awarenessLevelId: "",
        scenarioDescription: "",
        angleDirection: "",
        platform: "",
        duration: "",
        language: "",
        toneOverride: "",
        notes: "",
        generateScript: false,
      });
      setProofAssets([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({
      briefName: "",
      contentType: "",
      targetObjection: "",
      personaId: "",
      awarenessLevelId: "",
      scenarioDescription: "",
      angleDirection: "",
      platform: "",
      duration: "",
      language: "",
      toneOverride: "",
      notes: "",
      generateScript: false,
    });
    setProofAssets([]);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const objections = [
    "Price / value concern",
    "Skepticism (does it work?)",
    "Already tried supplements",
    "Don't trust online brands",
    "Prefer natural remedies",
    "Fear of side effects",
  ];

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill the form below to request a new Script Generation.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            Brief submitted successfully!{" "}
            {form.generateScript ? "Script generation has been triggered." : "You can trigger generation later."}
          </div>
        )}

        <div className="space-y-5">
          {/* Brief Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              Brief Name
            </label>
            <Input
              value={form.briefName}
              onChange={(e) => update("briefName", e.target.value)}
              placeholder=""
            />
          </div>

          {/* Content Type + Target Objection */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Content Type
              </label>
              <Select value={form.contentType} onValueChange={(v) => update("contentType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {(config?.contentTypes || []).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Target Objection
              </label>
              <Select value={form.targetObjection} onValueChange={(v) => update("targetObjection", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {objections.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Persona + Awareness Level + Proof Assets */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Persona
              </label>
              <Select value={form.personaId} onValueChange={(v) => update("personaId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.label ? ` — ${p.label}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Awareness Level
              </label>
              <Select value={form.awarenessLevelId} onValueChange={(v) => update("awarenessLevelId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.level}. {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Proof Assets
              </label>
              <div className="flex gap-2">
                <Input
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  placeholder=""
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAsset())}
                />
                <Button variant="outline" size="icon" onClick={addAsset} className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {proofAssets.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {proofAssets.map((asset, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {asset}
                      <button onClick={() => removeAsset(i)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scenario Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              Scenario Description
            </label>
            <Textarea
              value={form.scenarioDescription}
              onChange={(e) => update("scenarioDescription", e.target.value)}
              rows={4}
            />
          </div>

          {/* Angle Direction */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              Angle Direction
            </label>
            <Textarea
              value={form.angleDirection}
              onChange={(e) => update("angleDirection", e.target.value)}
              rows={4}
            />
          </div>

          {/* Platform + Duration + Language */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Platform
              </label>
              <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {(config?.platforms || []).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Duration
              </label>
              <Select value={form.duration} onValueChange={(v) => update("duration", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {(config?.durations || []).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
                Language
              </label>
              <Select value={form.language} onValueChange={(v) => update("language", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {(config?.languages || []).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tone Override */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              Tone Override
            </label>
            <Input
              value={form.toneOverride}
              onChange={(e) => update("toneOverride", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
              Notes
            </label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
            />
          </div>

          {/* Generate Script checkbox */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-red-600 dark:text-red-400">
              Generate Script *
            </label>
            <button
              type="button"
              onClick={() => update("generateScript", !form.generateScript)}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {form.generateScript ? (
                <CheckSquare className="h-5 w-5 text-gray-900 dark:text-white" />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear form
          </button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
