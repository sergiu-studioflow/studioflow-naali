import { VideoBriefTabs } from "@/components/video/video-brief-tabs";

export const dynamic = "force-dynamic";

export default function VideoBriefsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Video Briefs
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Create video brief requests and generate production-ready briefs with shot lists and talent notes.
        </p>
      </div>

      <VideoBriefTabs />
    </div>
  );
}
