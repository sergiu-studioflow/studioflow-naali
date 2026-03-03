import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Trophy, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { AddWinnerForm } from "@/components/winners/add-winner-form";

export const dynamic = "force-dynamic";

async function getWinners() {
  return db
    .select()
    .from(schema.winners)
    .orderBy(desc(schema.winners.createdAt));
}

export default async function WinnersPage() {
  const winners = await getWinners();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Winners Library</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Winning ads and reference content for AI-powered script generation
          </p>
        </div>
        <AddWinnerForm />
      </div>

      {winners.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No winners yet"
          description="Add winning ads to build your reference library for better script generation."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {winner.name}
                </h3>
                {winner.mediaUrl && (
                  <a
                    href={winner.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {winner.platform && (
                <span className="mb-3 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {winner.platform}
                </span>
              )}

              {winner.aiSummary && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                  {winner.aiSummary}
                </p>
              )}

              {winner.notes && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                  {winner.notes}
                </p>
              )}

              <p className="mt-3 text-xs text-gray-400">
                {formatDate(winner.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
