import { Film } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ScriptGenerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Script Generation System
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create content briefs and generate AI-powered scripts with hooks, compliance, and production direction.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900">
        <Film className="h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          Coming soon
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Content briefs, generated scripts, and hook variations will be managed here.
        </p>
      </div>
    </div>
  );
}
