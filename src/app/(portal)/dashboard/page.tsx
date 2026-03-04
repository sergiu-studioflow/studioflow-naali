import { db, schema } from "@/lib/db";
import { count } from "drizzle-orm";
import { Brain, ClipboardCheck, Film, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

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
      description: "Brand knowledge base, personas, and awareness framework",
    },
    {
      name: "Script Review",
      href: "/script-review",
      icon: ClipboardCheck,
      description: "AI-powered compliance review and script correction",
      stat: stats.reviews,
      statLabel: "reviews",
    },
    {
      name: "Script Generation",
      href: "/script-generation",
      icon: Film,
      description: "Content briefs, AI scripts, and hook variations",
      stat: stats.scripts,
      statLabel: "scripts",
    },
    {
      name: "Video Briefs",
      href: "/video-briefs",
      icon: Video,
      description: "Production-ready video briefs with shot lists and talent notes",
      stat: stats.videoBriefs,
      statLabel: "briefs",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Your AI-powered creative production systems
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {systems.map((system, i) => (
          <Link
            key={system.href}
            href={system.href}
            className="animate-fade-up group relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <system.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {system.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {system.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-foreground group-hover:translate-x-0.5" />
            </div>
            {system.stat != null && (
              <div className="mt-5 flex items-baseline gap-2 border-t border-border pt-4">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {system.stat}
                </span>
                <span className="text-sm text-muted-foreground">
                  {system.statLabel}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
