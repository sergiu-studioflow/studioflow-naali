"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScriptForm } from "./script-form";
import { GeneratedScriptsTable } from "./generated-scripts-table";
import { HookVariationsTable } from "./hook-variations-table";
import { Film, FileText, Zap } from "lucide-react";

export function ScriptGenerationTabs() {
  return (
    <Tabs defaultValue="form">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="form" className="gap-2">
          <Film className="h-4 w-4" />
          Generate Script
        </TabsTrigger>
        <TabsTrigger value="scripts" className="gap-2">
          <FileText className="h-4 w-4" />
          Generated Scripts
        </TabsTrigger>
        <TabsTrigger value="hooks" className="gap-2">
          <Zap className="h-4 w-4" />
          Hook Variations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form">
        <ScriptForm />
      </TabsContent>

      <TabsContent value="scripts">
        <GeneratedScriptsTable />
      </TabsContent>

      <TabsContent value="hooks">
        <HookVariationsTable />
      </TabsContent>
    </Tabs>
  );
}
