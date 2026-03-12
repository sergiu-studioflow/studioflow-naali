"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CsvUploadForm } from "./csv-upload-form";
import { ReviewsTable } from "./reviews-table";
import { AngleMiningPanel } from "./angle-mining-panel";
import { Upload, MessageSquareText, Lightbulb } from "lucide-react";

export function FeedbackMiningTabs() {
  return (
    <Tabs defaultValue="import">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="import" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Reviews
        </TabsTrigger>
        <TabsTrigger value="reviews" className="gap-2">
          <MessageSquareText className="h-4 w-4" />
          Reviews Browser
        </TabsTrigger>
        <TabsTrigger value="mining" className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Angle Mining
        </TabsTrigger>
      </TabsList>

      <TabsContent value="import">
        <CsvUploadForm />
      </TabsContent>

      <TabsContent value="reviews">
        <ReviewsTable />
      </TabsContent>

      <TabsContent value="mining">
        <AngleMiningPanel />
      </TabsContent>
    </Tabs>
  );
}
