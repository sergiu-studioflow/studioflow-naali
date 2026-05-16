import { db, schema } from "@/lib/db";
import { count } from "drizzle-orm";
import { Brain, ClipboardCheck, Film, Video, ImageIcon, MessageSquareText, Target, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getStats() {
  const [[briefs], [scripts], [reviews], [videoBriefs]] = await Promise.all([
    db.select({ total: count() }).from(schema.contentBriefs),
    db.select({ total: count() }).from(schema.generatedScripts),
    db.select({ total: count() }).from(schema.scriptReviews),
    db.select({ total: count() }).from(schema.videoBriefRequests),
  ]);

  return {
    briefs: briefs.total,
    scripts: scripts.total,
    reviews: reviews.total,
    videoBriefs: videoBriefs.total,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const systems = [
    {
      name: "Brand Intelligence",
      href: "/brand-intelligence",
      icon: Brain,
      description: "Ground-truth Naali — relief-brand voice, exhaustion vocabulary, the saffron supplement product set. Every AI here reads this first.",
    },
    {
      name: "Script Review & Correction System",
      href: "/script-review",
      icon: ClipboardCheck,
      description: "Compliance + honest-limits voice check. Catches medical-claim drift and aspirational language Naali avoids.",
      stat: stats.reviews,
      statLabel: "reviews",
    },
    {
      name: "Script Generation System",
      href: "/script-generation",
      icon: Film,
      description: "Épuisée?-led hooks, Naali persona angles, and full scripts tuned to French wellness customers reaching breaking point.",
      stat: stats.scripts,
      statLabel: "scripts",
    },
    {
      name: "Video Brief System",
      href: "/video-briefs",
      icon: Video,
      description: "Shoot-ready 9:16 briefs grounded in Naali's 150K-customer reorder stories — shot list, talent notes, locked vs adjustable elements.",
      stat: stats.videoBriefs,
      statLabel: "briefs",
    },
    {
      name: "Competitor Research",
      href: "/competitor-ads",
      icon: Target,
      description: "Watch what's working in French wellness + saffron-supplement category — Meta, TikTok, and Instagram in one feed.",
    },
    {
      name: "Research Briefs",
      href: "/briefs",
      icon: FileText,
      description: "Strategic briefs distilled from competitor signal and reorder-customer language — ready to drop into the script flow.",
    },
    {
      name: "Customer Feedback Mining",
      href: "/feedback-mining",
      icon: MessageSquareText,
      description: "Mine exhaustion-and-restoration language from real reorder reviews. Turns customer words into briefs and angles.",
    },
    {
      name: "Static Ad System",
      href: "/static-ads",
      icon: ImageIcon,
      description: "On-brand static ads with the Naali saffron palette + gummy product mark baked into a curated reference library.",
    },
    {
      name: "Video Generation",
      href: "/video-generation",
      icon: Video,
      description: "UGC, B-Roll, and A-Roll videos rendered in Naali's warm, restorative tone — script in, finished MP4 out.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Branded hero strip */}
      <section className="card-accent animate-fade-up relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-secondary/40 to-background p-8 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,hsla(354,73%,76%,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="hidden md:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card shadow-card ring-1 ring-primary/10 overflow-hidden">
              <Image
                src="/client-logo.png"
                alt="Naali"
                width={64}
                height={64}
                priority
                className="h-16 w-16 object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Naali
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                <span className="font-display italic font-normal text-primary">Creative Studio</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                <span className="font-display italic text-foreground/90">Le studio créatif de Naali — où l'épuisement devient une stratégie de marque.</span>{" "}
                AI-powered hooks, scripts, video briefs, ads, and generation built around Naali's relief-brand voice and 150K-customer proof.
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/naali-logo.png"
              alt="Naali wordmark"
              width={200}
              height={52}
              priority
              className="h-auto w-[200px] opacity-90 dark:brightness-0 dark:invert"
            />
          </div>
        </div>
      </section>

      {/* System grid */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Systems
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {systems.map((system, i) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-accent animate-fade-up group relative rounded-xl border border-border bg-card p-7 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              {/* Top accent bar — appears on hover */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/30 via-primary/80 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <system.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                      {system.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {system.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-foreground group-hover:translate-x-1" />
              </div>
              {system.stat != null && (
                <div className="mt-5 flex items-baseline gap-2 border-t border-border pt-4">
                  <span className="text-4xl font-bold tracking-tight text-primary">
                    {system.stat}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {system.statLabel}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
