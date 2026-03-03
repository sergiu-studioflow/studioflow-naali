import { db, schema } from "@/lib/db";
import { count } from "drizzle-orm";
import { Brain, ClipboardCheck, Film, Video } from "lucide-react";
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
      name: "Brand Intelligence Layer",
      href: "/brand-intelligence",
      icon: Brain,
      description: "Brand knowledge base, personas, and awareness framework",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      name: "Script Review & Correction",
      href: "/script-review",
      icon: ClipboardCheck,
      description: "AI-powered compliance review and script correction",
      stat: `${stats.reviews} reviews`,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      name: "Script Generation",
      href: "/script-generation",
      icon: Film,
      description: "Content briefs, AI scripts, and hook variations",
      stat: `${stats.briefs} briefs, ${stats.scripts} scripts`,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      name: "Video Brief System",
      href: "/video-briefs",
      icon: Video,
      description: "Production-ready video briefs with shot lists and talent notes",
      stat: `${stats.videoBriefs} briefs`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Naali Creative Studio — your AI-powered creative production systems
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {systems.map((system) => (
          <Link
            key={system.href}
            href={system.href}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-border hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2.5 ${system.bgColor}`}>
                <system.icon className={`h-5 w-5 ${system.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-200">
                  {system.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {system.description}
                </p>
                {system.stat && (
                  <p className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {system.stat}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
