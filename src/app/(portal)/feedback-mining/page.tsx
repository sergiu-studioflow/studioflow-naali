import { FeedbackMiningTabs } from "@/components/feedback/feedback-mining-tabs";

export const dynamic = "force-dynamic";

export default function FeedbackMiningPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Customer Feedback Mining
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Import customer reviews, browse feedback data, and generate AI-powered
          angle briefs and persona insights.
        </p>
      </div>

      <FeedbackMiningTabs />
    </div>
  );
}
