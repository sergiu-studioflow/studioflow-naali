import { db, schema } from "@/lib/db";
import { desc, eq, sql, count } from "drizzle-orm";
import { FileText, Film, ClipboardCheck, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [briefStats] = await db
    .select({
      total: count(),
      newCount: count(sql`CASE WHEN ${schema.contentBriefs.status} = 'new' THEN 1 END`),
      processingCount: count(sql`CASE WHEN ${schema.contentBriefs.status} = 'processing' THEN 1 END`),
      completeCount: count(sql`CASE WHEN ${schema.contentBriefs.status} = 'complete' THEN 1 END`),
      errorCount: count(sql`CASE WHEN ${schema.contentBriefs.status} = 'error' THEN 1 END`),
    })
    .from(schema.contentBriefs);

  const [scriptCount] = await db.select({ total: count() }).from(schema.generatedScripts);
  const [reviewCount] = await db.select({ total: count() }).from(schema.scriptReviews);

  return {
    briefs: briefStats,
    scripts: scriptCount.total,
    reviews: reviewCount.total,
  };
}

async function getRecentBriefs() {
  return db
    .select()
    .from(schema.contentBriefs)
    .orderBy(desc(schema.contentBriefs.createdAt))
    .limit(5);
}

async function getRecentScripts() {
  return db
    .select()
    .from(schema.generatedScripts)
    .orderBy(desc(schema.generatedScripts.createdAt))
    .limit(5);
}

export default async function DashboardPage() {
  const [stats, recentBriefs, recentScripts] = await Promise.all([
    getStats(),
    getRecentBriefs(),
    getRecentScripts(),
  ]);

  const statCards = [
    {
      label: "Content Briefs",
      value: stats.briefs.total,
      icon: FileText,
      detail: `${stats.briefs.processingCount} processing`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Generated Scripts",
      value: stats.scripts,
      icon: Film,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Script Reviews",
      value: stats.reviews,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your creative production pipeline
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.detail && (
                  <p className="text-xs text-gray-500">{stat.detail}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Indicator */}
      {stats.briefs.processingCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {stats.briefs.processingCount} brief{stats.briefs.processingCount > 1 ? "s" : ""} currently being generated...
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Briefs */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Briefs</h2>
            <Link href="/briefs" className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentBriefs.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">No briefs yet</p>
            ) : (
              recentBriefs.map((brief) => (
                <Link
                  key={brief.id}
                  href={`/briefs/${brief.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {brief.briefName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {brief.contentType} &middot; {formatDateTime(brief.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={brief.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Scripts */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Scripts</h2>
            <Link href="/scripts" className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentScripts.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">No scripts generated yet</p>
            ) : (
              recentScripts.map((script) => (
                <Link
                  key={script.id}
                  href={`/scripts/${script.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {script.scriptTitle || "Untitled Script"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {script.platform} &middot; {formatDateTime(script.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={script.reviewStatus || "draft"} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
