import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import { Users, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPersonas() {
  return db
    .select()
    .from(schema.personas)
    .orderBy(asc(schema.personas.sortOrder));
}

export default async function PersonasPage() {
  const personas = await getPersonas();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/brand-intel"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Target Personas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Defined audience segments used in script generation
          </p>
        </div>
      </div>

      {personas.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No personas defined"
          description="Personas will be loaded from your brand intelligence setup."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {persona.name}
                </h3>
                {persona.label && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">{persona.label}</p>
                )}
              </div>

              <div className="space-y-3">
                <PersonaField label="Demographics" value={persona.demographics} />
                <PersonaField label="Situation" value={persona.situation} />
                <PersonaField label="Pain Points" value={persona.painPoints} />
                <PersonaField label="What They Have Tried" value={persona.whatTheyTried} />
                <PersonaField label="What They Want" value={persona.whatTheyWant} />
                <PersonaField label="Objections" value={persona.objections} />
                <PersonaField label="Conversion Triggers" value={persona.conversionTriggers} />
                <PersonaField label="Messaging Notes" value={persona.messagingNotes} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PersonaField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
        {value}
      </p>
    </div>
  );
}
