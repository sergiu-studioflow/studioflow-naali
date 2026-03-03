import { BrandDocSection } from "@/components/brand-intel/brand-doc-section";
import { PersonasSection } from "@/components/brand-intel/personas-section";
import { AwarenessLevelsSection } from "@/components/brand-intel/awareness-levels-section";

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

      <BrandDocSection />
      <PersonasSection />
      <AwarenessLevelsSection />
    </div>
  );
}
