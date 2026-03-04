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
import type { Persona, AwarenessLevel, Product } from "@/lib/types";

export function ScriptReviewForm() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [levels, setLevels] = useState<AwarenessLevel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    scriptTitle: "",
    scriptText: "",
    agencyAwarenessLevel: "",
    product: "",
    targetPersona: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/personas").then((r) => r.json()),
      fetch("/api/awareness-levels").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([p, l, prod]) => {
        setPersonas(p);
        setLevels(l);
        setProducts(prod);
      })
      .catch(() => setError("Failed to load form options"))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.scriptTitle.trim()) {
      setError("Script Title is required");
      return;
    }
    if (!form.scriptText.trim()) {
      setError("Script Text is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: Record<string, unknown> = {
        scriptTitle: form.scriptTitle,
        scriptText: form.scriptText,
        agencyAwarenessLevel: parseInt(form.agencyAwarenessLevel) || null,
        product: form.product || null,
        targetPersona: form.targetPersona || null,
      };

      const res = await fetch("/api/script-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit script");
      }

      setSuccess(true);
      setForm({
        scriptTitle: "",
        scriptText: "",
        agencyAwarenessLevel: "",
        product: "",
        targetPersona: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({
      scriptTitle: "",
      scriptText: "",
      agencyAwarenessLevel: "",
      product: "",
      targetPersona: "",
    });
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

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Submit a script for AI-powered compliance and brand voice review.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
            Script submitted successfully. Go to All Scripts tab to trigger review.
          </div>
        )}

        <div className="space-y-5">
          {/* Script Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Script Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.scriptTitle}
              onChange={(e) => update("scriptTitle", e.target.value)}
              placeholder="e.g., Product Launch - Pain Point Hook"
            />
          </div>

          {/* Script Text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Script Text <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={form.scriptText}
              onChange={(e) => update("scriptText", e.target.value)}
              placeholder="Paste or write the full script text here..."
              rows={8}
            />
          </div>

          {/* Awareness Level + Product + Persona */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Agency Awareness Level
              </label>
              <Select
                value={form.agencyAwarenessLevel}
                onValueChange={(v) => update("agencyAwarenessLevel", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.id} value={String(l.level)}>
                      {l.level}. {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Product
              </label>
              <Select
                value={form.product}
                onValueChange={(v) => update("product", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Target Persona
              </label>
              <Select
                value={form.targetPersona}
                onValueChange={(v) => update("targetPersona", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}{p.label ? ` \u2014 ${p.label}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
