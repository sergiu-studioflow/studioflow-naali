"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScriptReviewForm } from "./script-review-form";
import { ScriptReviewsTable } from "./script-reviews-table";
import { ClipboardCheck, FileText } from "lucide-react";

export function ScriptReviewTabs() {
  return (
    <Tabs defaultValue="form">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="form" className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Submit Script
        </TabsTrigger>
        <TabsTrigger value="scripts" className="gap-2">
          <FileText className="h-4 w-4" />
          All Scripts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form">
        <ScriptReviewForm />
      </TabsContent>

      <TabsContent value="scripts">
        <ScriptReviewsTable />
      </TabsContent>
    </Tabs>
  );
}
