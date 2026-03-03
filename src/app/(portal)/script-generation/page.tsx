import { ScriptGenerationTabs } from "@/components/scripts/script-generation-tabs";

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

      <ScriptGenerationTabs />
    </div>
  );
}
