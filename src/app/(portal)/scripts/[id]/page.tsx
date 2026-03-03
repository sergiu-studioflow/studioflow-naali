import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ScriptDisplay } from "@/components/briefs/script-display";
import { HookVariationsGrid } from "@/components/briefs/hook-variations-grid";
import { ScriptReviewActions } from "@/components/scripts/review-actions";

export const dynamic = "force-dynamic";

async function getScriptWithHooks(id: string) {
  const [script] = await db
    .select()
    .from(schema.generatedScripts)
    .where(eq(schema.generatedScripts.id, id))
    .limit(1);

  if (!script) return null;

  const hooks = await db
    .select()
    .from(schema.hookVariations)
    .where(eq(schema.hookVariations.scriptId, id))
    .orderBy(schema.hookVariations.sortOrder);

  // Get the brief info
  const [brief] = await db
    .select()
    .from(schema.contentBriefs)
    .where(eq(schema.contentBriefs.id, script.briefId))
    .limit(1);

  return { script, hooks, brief: brief || null };
}

export default async function ScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getScriptWithHooks(id);

  if (!data) notFound();

  const { script, hooks, brief } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/scripts"
            className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {script.scriptTitle || "Untitled Script"}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge status={script.reviewStatus || "draft"} />
              {script.platform && (
                <span className="text-sm text-gray-500">{script.platform}</span>
              )}
              {script.duration && (
                <span className="text-sm text-gray-500">{script.duration}</span>
              )}
              <span className="text-sm text-gray-500">
                {formatDateTime(script.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {brief && (
          <Link
            href={`/briefs/${brief.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            View Brief
          </Link>
        )}
      </div>

      {/* Script Metadata */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Content Type</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{script.contentType || "--"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Platform</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{script.platform || "--"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Duration</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{script.duration || "--"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Review Status</p>
            <div className="mt-1">
              <StatusBadge status={script.reviewStatus || "draft"} />
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      {(script.reviewStatus === "draft" || !script.reviewStatus) && (
        <ScriptReviewActions scriptId={script.id} />
      )}

      {/* Review Notes (if reviewed) */}
      {script.reviewNotes && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Review Notes</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {script.reviewNotes}
          </p>
          {script.reviewedAt && (
            <p className="mt-2 text-xs text-gray-500">
              Reviewed {formatDateTime(script.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {/* Script Content */}
      <ScriptDisplay script={script} />

      {/* Hook Variations */}
      {hooks.length > 0 && (
        <HookVariationsGrid hooks={hooks} />
      )}
    </div>
  );
}
