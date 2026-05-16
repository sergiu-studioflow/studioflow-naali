"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Pencil, Save, X, Loader2, ChevronRight, Eye, Code2, BookOpen, Clock, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface BrandIntel {
  id: string;
  title: string;
  rawContent: string | null;
  complianceRules: string | null;
  updatedAt: string | null;
}

function preprocessRules(text: string): string {
  if (!text) return "";
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  const isTitleLine = (raw: string, prevBlank: boolean, nextBlank: boolean): boolean => {
    const line = raw.trim();
    if (line.length === 0 || line.length > 80) return false;
    if (!prevBlank || !nextBlank) return false;
    if (/^[#\-*>]/.test(line) || /^```/.test(line) || /^\d+\.\s/.test(line)) return false;
    if (/[.!?:,;]$/.test(line)) return false;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 10) return false;
    if (!/[A-Z]/.test(line)) return false;
    return true;
  };
  let firstHeadingApplied = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (isTitleLine(line, prevBlank, nextBlank)) {
      const prefix = firstHeadingApplied ? "## " : "# ";
      firstHeadingApplied = true;
      out.push(prefix + line.trim());
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function extractToc(processed: string): Array<{ id: string; text: string; level: 1 | 2 | 3 }> {
  const headings: Array<{ id: string; text: string; level: 1 | 2 | 3 }> = [];
  const seen = new Set<string>();
  for (const line of processed.split("\n")) {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (!m) continue;
    const level = m[1].length as 1 | 2 | 3;
    const text = m[2].trim();
    let id = slugify(text);
    let n = 2;
    while (seen.has(id)) id = `${slugify(text)}-${n++}`;
    seen.add(id);
    headings.push({ id, text, level });
  }
  return headings;
}

function readingStats(text: string): { words: number; minutes: number } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return { words, minutes };
}

export function ComplianceRulesSection() {
  const [intel, setIntel] = useState<BrandIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false); // Default OPEN — compliance is high-priority
  const [editPreview, setEditPreview] = useState<"split" | "edit" | "preview">("split");
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/brand-intel")
      .then((res) => res.json())
      .then((data) => {
        setIntel(data);
        setDraft(data?.complianceRules || "");
      })
      .catch(() => setError("Failed to load compliance rules"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editing && textareaRef.current) textareaRef.current.focus();
  }, [editing]);

  const handleEdit = () => {
    setDraft(intel?.complianceRules || "");
    setEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setDraft(intel?.complianceRules || "");
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
        body: JSON.stringify({ complianceRules: draft }),
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

  const sourceContent = editing ? draft : intel?.complianceRules || "";
  const processed = useMemo(() => preprocessRules(sourceContent), [sourceContent]);
  const toc = useMemo(() => extractToc(processed), [processed]);
  const stats = useMemo(() => readingStats(sourceContent), [sourceContent]);

  const handleHeadingIntersection = useCallback(() => {
    if (!proseRef.current) return;
    const headings = proseRef.current.querySelectorAll("h1[id], h2[id], h3[id]");
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeadingId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (collapsed || editing) return;
    const cleanup = handleHeadingIntersection();
    return cleanup;
  }, [collapsed, editing, processed, handleHeadingIntersection]);

  return (
    <Card className="border-amber-500/40 dark:border-amber-500/30">
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none"
        onClick={() => !editing && setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-90"}`} />
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-500/15 ring-1 ring-amber-500/30">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Compliance Rules Document
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30">
                Strict
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Strict rules every AI generator follows. Edit here once — every workflow picks up the change on the
              next generation.
            </p>
            {intel && !editing && (
              <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {intel.updatedAt && <span>Last updated {new Date(intel.updatedAt).toLocaleDateString()}</span>}
                {sourceContent && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {stats.words.toLocaleString()} words
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stats.minutes} min read
                    </span>
                    {toc.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {toc.length} section{toc.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {editing ? (
              <>
                <div className="hidden md:flex items-center rounded-md border border-border bg-card p-0.5 mr-1">
                  <button
                    onClick={() => setEditPreview("edit")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-all",
                      editPreview === "edit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    <Code2 className="inline h-3 w-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setEditPreview("split")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-all",
                      editPreview === "split" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setEditPreview("preview")}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-all",
                      editPreview === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    <Eye className="inline h-3 w-3 mr-1" />
                    Preview
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
                  {saving ? "Saving…" : "Save rules"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <>
          {error && (
            <div className="mx-6 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : editing ? (
              <EditView
                draft={draft}
                onChange={setDraft}
                processed={processed}
                mode={editPreview}
                textareaRef={textareaRef}
              />
            ) : intel?.complianceRules ? (
              <ReadView processed={processed} toc={toc} activeHeadingId={activeHeadingId} proseRef={proseRef} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldCheck className="h-10 w-10 text-amber-500" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No compliance rules set. Every generator will refuse to produce output until you add them.
                </p>
                <Button size="sm" className="mt-4 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleEdit}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Add compliance rules
                </Button>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

/* ─── Reading view (amber-accented) ─── */

function ReadView({
  processed,
  toc,
  activeHeadingId,
  proseRef,
}: {
  processed: string;
  toc: Array<{ id: string; text: string; level: 1 | 2 | 3 }>;
  activeHeadingId: string | null;
  proseRef: React.RefObject<HTMLDivElement | null>;
}) {
  const showToc = toc.filter((h) => h.level === 2).length >= 3;

  return (
    <div className={cn("relative grid gap-8", showToc ? "lg:grid-cols-[1fr_220px]" : "grid-cols-1")}>
      <article
        ref={proseRef}
        className={cn(
          "max-w-3xl",
          "prose prose-base dark:prose-invert max-w-none",
          // Headings — amber-tinted (compliance = warning) + display italic
          "prose-headings:font-display prose-headings:italic prose-headings:font-normal prose-headings:text-amber-700 dark:prose-headings:text-amber-400 prose-headings:tracking-tight",
          "prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-2 prose-h1:pb-3 prose-h1:border-b prose-h1:border-amber-500/30",
          "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:scroll-mt-24",
          "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-h3:scroll-mt-24",
          // Paragraphs
          "prose-p:text-foreground/90 prose-p:leading-[1.75] prose-p:my-3.5",
          // Strong / em
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-em:text-foreground/90",
          // Lists — amber bullets emphasise rules
          "prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:text-foreground/90 prose-li:leading-relaxed",
          "prose-li:marker:text-amber-600 dark:prose-li:marker:text-amber-400",
          // Blockquote — typically the disclaimer text
          "prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:rounded-r-lg prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-foreground",
          // Code (inline) for replacement words
          "prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em] prose-code:font-medium prose-code:before:hidden prose-code:after:hidden",
          // Tables — language cheat sheets
          "prose-table:my-4 prose-table:text-sm",
          "prose-th:bg-amber-500/10 prose-th:text-amber-800 dark:prose-th:text-amber-300 prose-th:font-semibold prose-th:text-left",
          "prose-td:align-top prose-td:py-2",
          // hr
          "prose-hr:my-8 prose-hr:border-border",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => {
              const text = String(children);
              const id = slugify(text);
              return <h1 id={id} {...props}>{children}</h1>;
            },
            h2: ({ children, ...props }) => {
              const text = String(children);
              const id = slugify(text);
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const text = String(children);
              const id = slugify(text);
              return <h3 id={id} {...props}>{children}</h3>;
            },
          }}
        >
          {processed}
        </ReactMarkdown>
      </article>

      {showToc && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              In this rulebook
            </p>
            <nav className="flex flex-col gap-1">
              {toc
                .filter((h) => h.level <= 3)
                .map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", `#${h.id}`);
                    }}
                    className={cn(
                      "block rounded-md px-2.5 py-1.5 text-xs leading-snug transition-all",
                      h.level === 3 && "pl-6",
                      activeHeadingId === h.id
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    {h.text}
                  </a>
                ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}

/* ─── Edit view ─── */

function EditView({
  draft,
  onChange,
  processed,
  mode,
  textareaRef,
}: {
  draft: string;
  onChange: (s: string) => void;
  processed: string;
  mode: "split" | "edit" | "preview";
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const showEdit = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
        <span className="font-semibold">Heads up:</span> changes here propagate to every Naali generator on the
        next generation. Use{" "}
        <code className="font-mono">## Section title</code> ·{" "}
        <code className="font-mono">**bold**</code> ·{" "}
        <code className="font-mono">- list item</code> ·{" "}
        <code className="font-mono">{`> disclaimer block`}</code> for structure.
      </div>
      <div className={cn("grid gap-3", mode === "split" ? "lg:grid-cols-2" : "grid-cols-1")}>
        {showEdit && (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your compliance rules here. Markdown supported."
            className="min-h-[600px] w-full rounded-lg border border-input bg-background p-4 text-[13px] font-mono leading-[1.7] outline-none resize-y focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/15 placeholder:text-muted-foreground transition-all"
            spellCheck
          />
        )}
        {showPreview && (
          <div className="min-h-[600px] overflow-auto rounded-lg border border-border bg-card p-5 text-sm">
            {processed.trim() ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:italic prose-headings:font-normal prose-headings:text-amber-700 dark:prose-headings:text-amber-400 prose-h1:text-2xl prose-h2:text-lg prose-h2:mt-6 prose-h3:text-base prose-p:text-foreground/90 prose-p:leading-relaxed prose-strong:text-foreground prose-li:marker:text-amber-600 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:rounded-r prose-blockquote:not-italic">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">Preview will render here as you type.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
