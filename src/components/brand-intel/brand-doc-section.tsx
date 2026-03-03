"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Pencil, Save, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BrandIntel {
  id: string;
  title: string;
  rawContent: string | null;
  updatedAt: string | null;
}

export function BrandDocSection() {
  const [intel, setIntel] = useState<BrandIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/brand-intel")
      .then((res) => res.json())
      .then((data) => {
        setIntel(data);
        setDraft(data?.rawContent || "");
      })
      .catch(() => setError("Failed to load brand intelligence"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.max(500, textareaRef.current.scrollHeight) + "px";
    }
  }, [editing]);

  const handleEdit = () => {
    setDraft(intel?.rawContent || "");
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setDraft(intel?.rawContent || "");
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brand-intel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      setIntel(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.max(500, e.target.scrollHeight) + "px";
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Brand Intelligence Document</CardTitle>
            {intel?.updatedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Last updated: {new Date(intel.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3.5 w-3.5" />
                )}
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <CardContent>
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleTextareaInput}
            placeholder="Write your brand intelligence document here... (Markdown supported)"
            className="w-full min-h-[500px] rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-mono leading-relaxed outline-none resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-indigo-700 dark:focus:ring-indigo-900/30 placeholder:text-gray-400"
            spellCheck
          />
        ) : intel?.rawContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-gray-600 dark:[&_p]:text-gray-300 [&_p]:mb-3 [&_li]:text-gray-600 dark:[&_li]:text-gray-300 [&_code]:text-gray-800 dark:[&_code]:text-gray-200">
            <ReactMarkdown>{intel.rawContent}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No brand intelligence document yet.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Add Brand Intel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
