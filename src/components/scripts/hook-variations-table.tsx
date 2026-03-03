"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Loader2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HookWithScript {
  id: string;
  scriptId: string;
  hookTitle: string | null;
  hookType: string | null;
  hookText: string | null;
  visualDescription: string | null;
  whyItWorks: string | null;
  platformBestFit: string | null;
  estimatedStopRate: string | null;
  sortOrder: number | null;
  createdAt: Date;
  scriptTitle: string | null;
}

const stopRateColor: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300" },
  Medium: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  Low: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-700 dark:text-red-300" },
};

export function HookVariationsTable() {
  const [hooks, setHooks] = useState<HookWithScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<HookWithScript | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hooks")
      .then((r) => r.json())
      .then((data) => setHooks(data))
      .catch(() => setError("Failed to load hook variations"))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (hook: HookWithScript) => {
    setSelected(hook);
    setDialogOpen(true);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-lg">Hook Variations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {hooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Zap className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No hook variations yet. They are generated alongside scripts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Hook Title
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      Script
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Stop Rate
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400 w-16">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {hooks.map((hook) => {
                    const rate = stopRateColor[hook.estimatedStopRate || ""] || {
                      bg: "bg-gray-50 dark:bg-gray-900",
                      text: "text-gray-600 dark:text-gray-400",
                    };
                    return (
                      <tr
                        key={hook.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => openDetail(hook)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                          {hook.hookTitle || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {hook.hookType || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell max-w-[180px] truncate">
                          {hook.scriptTitle || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {hook.platformBestFit || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {hook.estimatedStopRate ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${rate.bg} ${rate.text}`}
                            >
                              {hook.estimatedStopRate}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                          {formatDate(hook.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Eye className="inline h-3.5 w-3.5 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hook Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.hookTitle || "Hook Detail"}</DialogTitle>
            <DialogDescription>
              {selected?.hookType && `${selected.hookType}`}
              {selected?.platformBestFit && ` · Best for ${selected.platformBestFit}`}
              {selected?.estimatedStopRate && ` · ${selected.estimatedStopRate} stop rate`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {selected.hookText && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                    Hook Text
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {selected.hookText}
                  </div>
                </div>
              )}
              {selected.visualDescription && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                    Visual Description
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {selected.visualDescription}
                  </div>
                </div>
              )}
              {selected.whyItWorks && (
                <div>
                  <h4 className="mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                    Why It Works
                  </h4>
                  <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {selected.whyItWorks}
                  </div>
                </div>
              )}
              {selected.scriptTitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  From script: {selected.scriptTitle}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
