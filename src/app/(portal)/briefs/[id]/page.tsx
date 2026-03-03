import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { BriefTriggerButton } from "@/components/briefs/trigger-button";
import { ScriptDisplay } from "@/components/briefs/script-display";
import { HookVariationsGrid } from "@/components/briefs/hook-variations-grid";

export const dynamic = "force-dynamic";

async function getBriefWithRelations(id: string) {
  const [brief] = await db
    .select()
    .from(schema.contentBriefs)
    .where(eq(schema.contentBriefs.id, id))
    .limit(1);

  if (!brief) return null;

  // Fetch persona if set
  let persona = null;
  if (brief.personaId) {
    const [p] = await db
      .select()
      .from(schema.personas)
      .where(eq(schema.personas.id, brief.personaId))
      .limit(1);
    persona = p || null;
  }

  // Fetch awareness level if set
  let awarenessLevel = null;
  if (brief.awarenessLevelId) {
    const [a] = await db
      .select()
      .from(schema.awarenessLevels)
      .where(eq(schema.awarenessLevels.id, brief.awarenessLevelId))
      .limit(1);
    awarenessLevel = a || null;
  }

  // Fetch generated script + hooks if complete
  let script = null;
  let hooks: (typeof schema.hookVariations.$inferSelect)[] = [];

  if (brief.status === "complete") {
    const [s] = await db
      .select()
      .from(schema.generatedScripts)
      .where(eq(schema.generatedScripts.briefId, id))
      .limit(1);

    if (s) {
      script = s;
      hooks = await db
        .select()
        .from(schema.hookVariations)
        .where(eq(schema.hookVariations.scriptId, s.id))
        .orderBy(schema.hookVariations.sortOrder);
    }
  }

  return { brief, persona, awarenessLevel, script, hooks };
}

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBriefWithRelations(id);

  if (!data) notFound();

  const { brief, persona, awarenessLevel, script, hooks } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/briefs"
            className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {brief.briefName}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <StatusBadge status={brief.status} />
              <span className="text-sm text-gray-500">
                Created {formatDateTime(brief.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {brief.status === "new" && (
          <BriefTriggerButton briefId={brief.id} />
        )}

        {script && (
          <Link
            href={`/scripts/${script.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            View Script
          </Link>
        )}
      </div>

      {/* Processing State */}
      {brief.status === "processing" && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-6 py-12 dark:border-amber-800 dark:bg-amber-950">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Generating script...
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            This usually takes 30-60 seconds. Refresh to check progress.
          </p>
        </div>
      )}

      {/* Error State */}
      {brief.status === "error" && brief.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Generation failed
          </p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {brief.errorMessage}
          </p>
        </div>
      )}

      {/* Brief Inputs */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Brief Details</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
          <DetailField label="Content Type" value={brief.contentType} />
          <DetailField label="Platform" value={brief.platform} />
          <DetailField label="Duration" value={brief.duration} />
          <DetailField label="Language" value={brief.language} />
          <DetailField label="Persona" value={persona?.name} />
          <DetailField
            label="Awareness Level"
            value={awarenessLevel ? `Level ${awarenessLevel.level}: ${awarenessLevel.name}` : null}
          />
          <DetailField label="Target Objection" value={brief.targetObjection} className="sm:col-span-2" />
          <DetailField label="Angle Direction" value={brief.angleDirection} className="sm:col-span-2" />
          <DetailField label="Scenario Description" value={brief.scenarioDescription} className="sm:col-span-2" />
          <DetailField label="Tone Override" value={brief.toneOverride} />
          <DetailField label="Notes" value={brief.notes} className="sm:col-span-2" />
        </div>
      </div>

      {/* Generated Script */}
      {script && (
        <ScriptDisplay script={script} />
      )}

      {/* Hook Variations */}
      {hooks.length > 0 && (
        <HookVariationsGrid hooks={hooks} />
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
        {value || <span className="text-gray-400">--</span>}
      </dd>
    </div>
  );
}
