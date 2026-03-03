import { Brain } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BrandIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Brand Intelligence Layer
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage the Naali brand knowledge base, personas, and awareness framework.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900">
        <Brain className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          Coming soon
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Brand intelligence, personas, and awareness levels will be managed here.
        </p>
      </div>
    </div>
  );
}
