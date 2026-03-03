"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";

export function BriefTriggerButton({ briefId }: { briefId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleTrigger() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/briefs/${briefId}/trigger`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to trigger");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger generation");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {loading ? "Triggering..." : "Generate Script"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
