import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { History, FileText, Film, ClipboardCheck, Brain, Zap, Check, RotateCcw, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

async function getActivityLog() {
  return db
    .select()
    .from(schema.activityLog)
    .orderBy(desc(schema.activityLog.createdAt))
    .limit(100);
}

function getActionDisplay(action: string): { icon: LucideIcon; label: string; color: string } {
  switch (action) {
    case "brief_created":
      return { icon: FileText, label: "Brief created", color: "text-blue-600 bg-blue-50 dark:bg-blue-950" };
    case "brief_triggered":
      return { icon: Zap, label: "Generation triggered", color: "text-amber-600 bg-amber-50 dark:bg-amber-950" };
    case "script_generated":
      return { icon: Film, label: "Script generated", color: "text-purple-600 bg-purple-50 dark:bg-purple-950" };
    case "script_approved":
      return { icon: Check, label: "Script approved", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" };
    case "script_revision_needed":
      return { icon: RotateCcw, label: "Revisions requested", color: "text-orange-600 bg-orange-50 dark:bg-orange-950" };
    case "script_rejected":
      return { icon: X, label: "Script rejected", color: "text-red-600 bg-red-50 dark:bg-red-950" };
    case "review_submitted":
      return { icon: ClipboardCheck, label: "Review submitted", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950" };
    case "brand_intel_updated":
      return { icon: Brain, label: "Brand intel updated", color: "text-teal-600 bg-teal-50 dark:bg-teal-950" };
    default:
      return { icon: History, label: action.replace(/_/g, " "), color: "text-gray-600 bg-gray-50 dark:bg-gray-900" };
  }
}

export default async function HistoryPage() {
  const activities = await getActivityLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Timeline of actions across your creative pipeline
        </p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity yet"
          description="Actions like creating briefs, generating scripts, and reviews will appear here."
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {activities.map((activity) => {
              const display = getActionDisplay(activity.action);
              const Icon = display.icon;
              const details = activity.details as Record<string, unknown> | null;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 px-5 py-4"
                >
                  <div className={`mt-0.5 rounded-lg p-2 ${display.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {display.label}
                    </p>
                    {details && ('briefName' in details || 'scriptTitle' in details) && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {'briefName' in details ? `Brief: ${String(details.briefName)}` : null}
                        {'scriptTitle' in details ? `Script: ${String(details.scriptTitle)}` : null}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                    {activity.resourceType}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
