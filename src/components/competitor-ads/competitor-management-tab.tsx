"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ExternalLink,
  RefreshCw,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import type { CompetitorSource } from "@/lib/types";
import { timeAgo } from "./utils";
import { META_AD_COUNTRIES } from "./countries";

export function CompetitorManagementTab({
  sources,
  onRefresh,
}: {
  sources: CompetitorSource[];
  onRefresh: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCountry, setNewCountry] = useState("GB");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<{ id: string; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim() || !newUrl.trim()) return;
    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/competitor-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, metaLibraryUrl: newUrl, country: newCountry }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to add competitor");
        return;
      }
      setNewName("");
      setNewUrl("");
      setNewCountry("GB");
      setShowAddForm(false);
      onRefresh();
    } catch {
      setAddError("Network error");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(source: CompetitorSource) {
    setTogglingId(source.id);
    try {
      await fetch("/api/competitor-sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id, isActive: !source.isActive }),
      });
      onRefresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this competitor? Existing ad data will be preserved.")) return;
    setDeletingId(id);
    try {
      await fetch("/api/competitor-sources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRefreshScrape(sourceId: string) {
    setRefreshingId(sourceId);
    setRefreshResult(null);
    try {
      const res = await fetch("/api/competitor-ads/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      if (data.empty) {
        setRefreshResult({ id: sourceId, message: "No active ads found" });
      } else if (data.error) {
        setRefreshResult({ id: sourceId, message: data.error });
      } else {
        setRefreshResult({ id: sourceId, message: "Scrape complete!" });
      }
      onRefresh();
    } catch {
      setRefreshResult({ id: sourceId, message: "Failed to reach scraper" });
    } finally {
      setRefreshingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Competitors</h2>
          <p className="text-sm text-muted-foreground">
            Add Meta Ad Library links to track competitor ads.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Competitor
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">New Competitor</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Competitor Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Hismile"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Meta Ad Library Link
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.facebook.com/ads/library/?...view_all_page_id=..."
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
              />
              <p className="mt-1 text-[11px] text-muted-foreground/60">
                Must contain a view_all_page_id parameter
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Country
              </label>
              <Select value={newCountry} onValueChange={setNewCountry}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {META_AD_COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label} ({c.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {addError && (
            <p className="text-sm text-red-500">{addError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim() || !newUrl.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddError(null); }}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Competitor list */}
      {sources.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">No competitors added</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Add a Meta Ad Library link to start tracking competitor ads.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className={`rounded-xl border bg-card p-4 transition-all ${
              source.isActive ? "border-border" : "border-border/50 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {source.name}
                  </h3>
                  <Badge variant={source.isActive ? "success" : "secondary"} className="text-[10px]">
                    {source.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {source.country}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <a
                    href={source.metaLibraryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary truncate max-w-[300px]"
                  >
                    Meta Ad Library <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <span>Last scraped: {timeAgo(source.lastScrapedAt)}</span>
                </div>
                {refreshResult?.id === source.id && (
                  <p className="text-xs text-muted-foreground mt-1">{refreshResult.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRefreshScrape(source.id)}
                  disabled={refreshingId === source.id || !source.isActive}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  title="Scrape now"
                >
                  {refreshingId === source.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {refreshingId === source.id ? "Scraping..." : "Refresh"}
                </button>

                <button
                  onClick={() => handleToggle(source)}
                  disabled={togglingId === source.id}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    source.isActive ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                  title={source.isActive ? "Deactivate" : "Activate"}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      source.isActive ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleDelete(source.id)}
                  disabled={deletingId === source.id}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
