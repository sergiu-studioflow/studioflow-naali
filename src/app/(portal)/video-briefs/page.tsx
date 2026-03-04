import { VideoBriefTabs } from "@/components/video/video-brief-tabs";

export const dynamic = "force-dynamic";

export default function VideoBriefsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Video Brief System
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create video brief requests and generate production-ready briefs with shot lists, talent notes, and compliance.
        </p>
      </div>

      <VideoBriefTabs />
    </div>
  );
}
