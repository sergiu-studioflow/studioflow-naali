import Image from "next/image";
import { Brain } from "lucide-react";
import { BrandDocSection } from "@/components/brand-intel/brand-doc-section";
import { ComplianceRulesSection } from "@/components/brand-intel/compliance-rules-section";
import { PersonasSection } from "@/components/brand-intel/personas-section";
import { AwarenessLevelsSection } from "@/components/brand-intel/awareness-levels-section";
import { TargetObjectionsSection } from "@/components/brand-intel/target-objections-section";
import { ProofAssetsSection } from "@/components/brand-intel/proof-assets-section";
import { MotivatorsSection } from "@/components/brand-intel/motivators-section";
import { ProductsModule } from "@/components/brand-intel/products-module";

export const dynamic = "force-dynamic";

export default function BrandIntelligencePage() {
  return (
    <div className="space-y-8">
      <section className="card-accent animate-fade-up relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-secondary/40 to-background p-5 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_30%,hsla(354,73%,76%,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card shadow-card ring-1 ring-primary/10 overflow-hidden">
            <Image
              src="/client-logo.png"
              alt="Naali"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              <Brain className="h-3 w-3" />
              Naali
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="font-display italic font-normal text-primary">Brand Intelligence</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Source of truth for every AI system in this portal — the relief-brand voice, the
              exhaustion vocabulary, the proof, the saffron supplement products. Edit here once,
              and every generation downstream picks it up.
            </p>
          </div>
        </div>
      </section>

      <ProductsModule />
      <ComplianceRulesSection />
      <BrandDocSection />
      <PersonasSection />
      <AwarenessLevelsSection />
      <TargetObjectionsSection />
      <ProofAssetsSection />
      <MotivatorsSection />
    </div>
  );
}
