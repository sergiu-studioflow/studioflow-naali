"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GeneratedScript } from "@/lib/types";

export function ScriptDisplay({ script }: { script: GeneratedScript }) {
  const sections = [
    { key: "fullScript", label: "Full Script", content: script.fullScript },
    { key: "sceneBreakdown", label: "Scene Breakdown", content: script.sceneBreakdown },
    { key: "visualDirection", label: "Visual Direction", content: script.visualDirection },
    { key: "audioDirection", label: "Audio Direction", content: script.audioDirection },
    { key: "dialogue", label: "Dialogue", content: script.dialogue },
    { key: "onScreenText", label: "On-Screen Text", content: script.onScreenText },
    { key: "emotionalArc", label: "Emotional Arc", content: script.emotionalArc },
    { key: "complianceReview", label: "Compliance Review", content: script.complianceReview },
  ].filter((s) => s.content);

  if (sections.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {script.scriptTitle || "Generated Script"}
        </h2>
      </div>
      <div className="p-5">
        <Tabs defaultValue={sections[0].key}>
          <TabsList className="w-full flex-wrap">
            {sections.map((section) => (
              <TabsTrigger key={section.key} value={section.key} className="text-xs">
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((section) => (
            <TabsContent key={section.key} value={section.key}>
              <div className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {section.content}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
