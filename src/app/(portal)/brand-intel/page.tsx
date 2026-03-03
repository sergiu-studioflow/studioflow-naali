import { db, schema } from "@/lib/db";
import { Brain, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { BrandIntelEditor } from "@/components/brand-intel/editor";

export const dynamic = "force-dynamic";

async function getBrandIntel() {
  const [intel] = await db.select().from(schema.brandIntelligence).limit(1);
  return intel || null;
}

export default async function BrandIntelPage() {
  const intel = await getBrandIntel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Intelligence</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your brand knowledge base that powers AI script generation
          </p>
        </div>
        <Link
          href="/brand-intel/personas"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <Users className="h-4 w-4" />
          Personas
        </Link>
      </div>

      {!intel || !intel.rawContent ? (
        <EmptyState
          icon={Brain}
          title="No brand intelligence loaded"
          description="Brand intelligence will be loaded by your StudioFlow system. Contact your admin to set it up."
        />
      ) : (
        <div className="space-y-4">
          {intel.updatedAt && (
            <p className="text-xs text-gray-500">
              Last updated: {formatDateTime(intel.updatedAt)}
            </p>
          )}
          <BrandIntelEditor initialContent={intel.rawContent} />
        </div>
      )}
    </div>
  );
}
