import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { ClipboardCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getReviews() {
  return db
    .select()
    .from(schema.scriptReviews)
    .orderBy(desc(schema.scriptReviews.createdAt));
}

export default async function ReviewPage() {
  const reviews = await getReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Script Reviews</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Submit scripts for AI-powered compliance and quality review
        </p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No reviews yet"
          description="Script reviews will appear here when submitted for AI analysis."
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
            <div className="col-span-4 text-xs font-medium uppercase tracking-wider text-gray-500">
              Script Title
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Compliance
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Score
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Review Status
            </div>
            <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Submitted
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-12 gap-4 px-5 py-4"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {review.scriptTitle}
                  </p>
                  {review.targetPersona && (
                    <p className="text-xs text-gray-500">{review.targetPersona}</p>
                  )}
                </div>
                <div className="col-span-2">
                  {review.complianceStatus ? (
                    <StatusBadge
                      status={
                        review.complianceStatus === "compliant"
                          ? "approved"
                          : review.complianceStatus === "non_compliant"
                          ? "rejected"
                          : "revision_needed"
                      }
                    />
                  ) : (
                    <span className="text-sm text-gray-400">--</span>
                  )}
                </div>
                <div className="col-span-2">
                  {review.overallScore !== null ? (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.overallScore}/100
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">--</span>
                  )}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={review.reviewStatus || "pending"} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">
                    {review.submittedAt
                      ? formatDateTime(review.submittedAt)
                      : formatDateTime(review.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
