"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Persona = {
  id: string;
  name: string;
  label: string | null;
};

type AwarenessLevel = {
  id: string;
  level: number;
  name: string;
};

type ConfigData = {
  contentTypes: string[];
  platforms: string[];
  durations: string[];
  languages: string[];
};

export default function NewBriefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form options loaded from API
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [awarenessLevels, setAwarenessLevels] = useState<AwarenessLevel[]>([]);
  const [config, setConfig] = useState<ConfigData>({
    contentTypes: [],
    platforms: [],
    durations: [],
    languages: [],
  });

  // Form state
  const [briefName, setBriefName] = useState("");
  const [contentType, setContentType] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [targetObjection, setTargetObjection] = useState("");
  const [angleDirection, setAngleDirection] = useState("");
  const [personaId, setPersonaId] = useState("");
  const [awarenessLevelId, setAwarenessLevelId] = useState("");
  const [platform, setPlatform] = useState("");
  const [duration, setDuration] = useState("");
  const [language, setLanguage] = useState("");
  const [toneOverride, setToneOverride] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadFormData() {
      try {
        const [configRes, personasRes, awarenessRes] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/personas"),
          fetch("/api/awareness-levels"),
        ]);

        if (configRes.ok) {
          const data = await configRes.json();
          setConfig({
            contentTypes: data.contentTypes || [],
            platforms: data.platforms || [],
            durations: data.durations || [],
            languages: data.languages || [],
          });
          if (data.languages?.length === 1) {
            setLanguage(data.languages[0]);
          }
        }
        if (personasRes.ok) {
          setPersonas(await personasRes.json());
        }
        if (awarenessRes.ok) {
          setAwarenessLevels(await awarenessRes.json());
        }
      } catch {
        // Options will remain empty, user can still type values
      }
    }
    loadFormData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = { briefName };
    if (contentType) payload.contentType = contentType;
    if (scenarioDescription) payload.scenarioDescription = scenarioDescription;
    if (targetObjection) payload.targetObjection = targetObjection;
    if (angleDirection) payload.angleDirection = angleDirection;
    if (personaId) payload.personaId = personaId;
    if (awarenessLevelId) payload.awarenessLevelId = awarenessLevelId;
    if (platform) payload.platform = platform;
    if (duration) payload.duration = duration;
    if (language) payload.language = language;
    if (toneOverride) payload.toneOverride = toneOverride;
    if (notes) payload.notes = notes;

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create brief");
      }

      const brief = await res.json();
      router.push(`/briefs/${brief.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/briefs"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Content Brief</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fill in the details to generate a creative script
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Brief Name */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brief Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={briefName}
                onChange={(e) => setBriefName(e.target.value)}
                placeholder="e.g. Summer Campaign - UGC Script"
                required
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Content Type
              </label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {config.contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform
              </label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent>
                  {config.platforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration..." />
                </SelectTrigger>
                <SelectContent>
                  {config.durations.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language..." />
                </SelectTrigger>
                <SelectContent>
                  {config.languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Persona */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Persona
              </label>
              <Select value={personaId} onValueChange={setPersonaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select persona..." />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}{p.label ? ` - ${p.label}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Awareness Level */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Awareness Level
              </label>
              <Select value={awarenessLevelId} onValueChange={setAwarenessLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select awareness level..." />
                </SelectTrigger>
                <SelectContent>
                  {awarenessLevels.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      Level {a.level}: {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scenario Description */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Scenario Description
              </label>
              <Textarea
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                placeholder="Describe the scene, situation, or context for this content..."
                rows={3}
              />
            </div>

            {/* Target Objection */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Objection
              </label>
              <Input
                value={targetObjection}
                onChange={(e) => setTargetObjection(e.target.value)}
                placeholder="What objection should this content address?"
              />
            </div>

            {/* Angle Direction */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Angle Direction
              </label>
              <Input
                value={angleDirection}
                onChange={(e) => setAngleDirection(e.target.value)}
                placeholder="e.g. Focus on social proof, authority, scarcity..."
              />
            </div>

            {/* Tone Override */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tone Override
              </label>
              <Input
                value={toneOverride}
                onChange={(e) => setToneOverride(e.target.value)}
                placeholder="Leave empty to use default brand tone"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or instructions..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/briefs"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !briefName.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Brief"}
          </button>
        </div>
      </form>
    </div>
  );
}
