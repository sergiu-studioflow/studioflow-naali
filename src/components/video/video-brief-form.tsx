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
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona, AwarenessLevel, AppConfig, TargetObjection, ProofAsset, Motivator } from "@/lib/types";

export function VideoBriefForm() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [levels, setLevels] = useState<AwarenessLevel[]>([]);
  const [targetObjections, setTargetObjections] = useState<TargetObjection[]>([]);
  const [proofAssetOptions, setProofAssetOptions] = useState<ProofAsset[]>([]);
  const [motivators, setMotivators] = useState<Motivator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    briefName: "",
    contentType: "",
    targetObjection: "",
    persona: "",
    awarenessLevel: "",
    scenarioDescription: "",
    angleDirection: "",
    platform: "",
    duration: "",
    language: "",
    productionConstraints: "",
    notes: "",
    motivator: "",
  });

  const [proofAssets, setProofAssets] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch("/api/personas").then((r) => r.json()),
      fetch("/api/awareness-levels").then((r) => r.json()),
      fetch("/api/target-objections").then((r) => r.json()),
      fetch("/api/proof-assets").then((r) => r.json()),
      fetch("/api/motivators").then((r) => r.json()),
    ])
      .then(([cfg, p, l, to, pa, m]) => {
        setConfig(cfg);
        setPersonas(p);
        setLevels(l);
        setTargetObjections(to);
        setProofAssetOptions(pa);
        setMotivators(m);
      })
      .catch(() => setError("Failed to load form options"))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleAsset = (asset: string) => {
    setProofAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    );
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
      // 1. Create the video brief request
      const briefPayload: Record<string, unknown> = {
        briefName: form.briefName,
      };
      if (form.contentType) briefPayload.contentType = form.contentType;
      if (form.targetObjection) briefPayload.targetObjection = form.targetObjection;
      if (form.persona) briefPayload.persona = form.persona;
      if (form.awarenessLevel) briefPayload.awarenessLevel = form.awarenessLevel;
      if (form.scenarioDescription) briefPayload.scenarioDescription = form.scenarioDescription;
      if (form.angleDirection) briefPayload.angleDirection = form.angleDirection;
      if (form.platform) briefPayload.platform = form.platform;
      if (form.duration) briefPayload.duration = form.duration;
      if (form.language) briefPayload.language = form.language;
      if (form.productionConstraints) briefPayload.productionConstraints = form.productionConstraints;
      if (form.notes) briefPayload.notes = form.notes;
      if (form.motivator) briefPayload.motivator = form.motivator;
      if (proofAssets.length > 0) briefPayload.proofAssets = proofAssets;

      const res = await fetch("/api/video-briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefPayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create brief");
      }

      const brief = await res.json();

      // 2. Trigger n8n video brief generation workflow
      const triggerRes = await fetch(`/api/video-briefs/${brief.id}/trigger`, {
        method: "POST",
      });
      if (!triggerRes.ok) {
        const data = await triggerRes.json().catch(() => ({}));
        throw new Error(data.error || "Brief created but failed to trigger generation");
      }

      setSuccess(true);
      // Reset form
      setForm({
        briefName: "",
        contentType: "",
        targetObjection: "",
        persona: "",
        awarenessLevel: "",
        scenarioDescription: "",
        angleDirection: "",
        platform: "",
        duration: "",
        language: "",
        productionConstraints: "",
        notes: "",
        motivator: "",
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
      persona: "",
      awarenessLevel: "",
      scenarioDescription: "",
      angleDirection: "",
      platform: "",
      duration: "",
      language: "",
      productionConstraints: "",
      notes: "",
      motivator: "",
    });
    setProofAssets([]);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Fill the form below to request a new Video Brief.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            Video brief request submitted and generation triggered successfully!
          </div>
        )}

        <div className="space-y-5">
          {/* Brief Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Brief Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.briefName}
              onChange={(e) => update("briefName", e.target.value)}
              placeholder="e.g., Hero Product Demo - TikTok"
            />
          </div>

          {/* Content Type + Target Objection */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Target Objection
              </label>
              <Select value={form.targetObjection} onValueChange={(v) => update("targetObjection", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {targetObjections.map((o) => (
                    <SelectItem key={o.id} value={o.name}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Persona + Awareness Level */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Persona
              </label>
              <Select value={form.persona} onValueChange={(v) => update("persona", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}{p.label ? ` — ${p.label}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Awareness Level
              </label>
              <Select value={form.awarenessLevel} onValueChange={(v) => update("awarenessLevel", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={l.name}>
                      {l.level}. {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proof Assets */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Proof Assets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {proofAssetOptions.map((asset) => {
                const isSelected = proofAssets.includes(asset.name);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleAsset(asset.name)}
                    className={cn(
                      "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {asset.name}
                  </button>
                );
              })}
            </div>
            {proofAssets.length > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {proofAssets.length} selected
              </p>
            )}
          </div>

          {/* Motivator */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Motivator
            </label>
            <Select value={form.motivator} onValueChange={(v) => update("motivator", v)}>
              <SelectTrigger>
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {motivators.map((m) => (
                  <SelectItem key={m.id} value={m.code}>
                    {m.code} — {m.subAngle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scenario Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Scenario Description
            </label>
            <Textarea
              value={form.scenarioDescription}
              onChange={(e) => update("scenarioDescription", e.target.value)}
              placeholder="Describe the scenario, setting, and context..."
              rows={4}
            />
          </div>

          {/* Angle Direction */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Angle Direction
            </label>
            <Textarea
              value={form.angleDirection}
              onChange={(e) => update("angleDirection", e.target.value)}
              placeholder="What angle or perspective should this video take?"
              rows={4}
            />
          </div>

          {/* Platform + Duration + Language */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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

          {/* Production Constraints */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Production Constraints
            </label>
            <Textarea
              value={form.productionConstraints}
              onChange={(e) => update("productionConstraints", e.target.value)}
              placeholder="Budget, locations, talent availability, equipment limitations, etc."
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Notes
            </label>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any other details for the production team..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
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
