import { BrandDocSection } from "@/components/brand-intel/brand-doc-section";
import { PersonasSection } from "@/components/brand-intel/personas-section";
import { AwarenessLevelsSection } from "@/components/brand-intel/awareness-levels-section";
import { TargetObjectionsSection } from "@/components/brand-intel/target-objections-section";
import { ProofAssetsSection } from "@/components/brand-intel/proof-assets-section";
import { MotivatorsSection } from "@/components/brand-intel/motivators-section";
import { ProductsSection } from "@/components/brand-intel/products-section";

export const dynamic = "force-dynamic";

export default function BrandIntelligencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Brand Intelligence
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          View and manage the Naali brand knowledge base, personas, and awareness framework.
        </p>
      </div>

      <BrandDocSection />
      <PersonasSection />
      <AwarenessLevelsSection />
      <TargetObjectionsSection />
      <ProofAssetsSection />
      <MotivatorsSection />
      <ProductsSection />
    </div>
  );
}
