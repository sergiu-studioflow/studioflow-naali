import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { FileText, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getBriefs() {
  return db
    .select()
    .from(schema.contentBriefs)
    .orderBy(desc(schema.contentBriefs.createdAt));
}

export default async function BriefsPage() {
  const briefs = await getBriefs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Briefs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your content briefs and track generation status
          </p>
        </div>
        <Link
          href="/briefs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Brief
        </Link>
      </div>

      {briefs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No briefs yet"
          description="Create your first content brief to start generating scripts."
          action={
            <Link
              href="/briefs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create Brief
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
            <div className="col-span-4 text-xs font-medium uppercase tracking-wider text-gray-500">
              Brief Name
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Content Type
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Platform
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {briefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {brief.briefName}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {brief.contentType || "--"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {brief.platform || "--"}
                  </p>
                </div>
                <div className="col-span-2">
                  <StatusBadge status={brief.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">
                    {formatDateTime(brief.createdAt)}
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
