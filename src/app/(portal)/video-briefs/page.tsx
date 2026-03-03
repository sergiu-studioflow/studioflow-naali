import { Video } from "lucide-react";

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

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900">
        <Video className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium text-foreground">
          Coming soon
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Video brief requests and generated production briefs will be managed here.
        </p>
      </div>
    </div>
  );
}
