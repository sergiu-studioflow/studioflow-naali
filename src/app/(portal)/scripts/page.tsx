import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Film } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getScripts() {
  return db
    .select()
    .from(schema.generatedScripts)
    .orderBy(desc(schema.generatedScripts.createdAt));
}

export default async function ScriptsPage() {
  const scripts = await getScripts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Scripts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse and review all generated scripts
        </p>
      </div>

      {scripts.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No scripts yet"
          description="Scripts will appear here once you generate them from a content brief."
          action={
            <Link
              href="/briefs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create a Brief
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
            <div className="col-span-4 text-xs font-medium uppercase tracking-wider text-gray-500">
              Script Title
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Content Type
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Platform
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Review Status
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {scripts.map((script) => (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {script.scriptTitle || "Untitled Script"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {script.contentType || "--"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {script.platform || "--"}
                  </p>
                </div>
                <div className="col-span-2">
                  <StatusBadge status={script.reviewStatus || "draft"} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">
                    {formatDateTime(script.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
