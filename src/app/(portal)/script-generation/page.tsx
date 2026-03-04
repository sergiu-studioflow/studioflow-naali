import { ScriptGenerationTabs } from "@/components/scripts/script-generation-tabs";

export const dynamic = "force-dynamic";

export default function ScriptGenerationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Script Generation
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create content briefs and generate AI-powered scripts with hooks and production direction.
        </p>
      </div>

      <ScriptGenerationTabs />
    </div>
  );
}
