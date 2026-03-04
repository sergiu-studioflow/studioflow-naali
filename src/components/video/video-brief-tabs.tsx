"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VideoBriefForm } from "./video-brief-form";
import { GeneratedVideoBriefsTable } from "./generated-video-briefs-table";
import { Video, FileText } from "lucide-react";

export function VideoBriefTabs() {
  return (
    <Tabs defaultValue="form">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="form" className="gap-2">
          <Video className="h-4 w-4" />
          Create Video Brief
        </TabsTrigger>
        <TabsTrigger value="briefs" className="gap-2">
          <FileText className="h-4 w-4" />
          Generated Briefs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form">
        <VideoBriefForm />
      </TabsContent>

      <TabsContent value="briefs">
        <GeneratedVideoBriefsTable />
      </TabsContent>
    </Tabs>
  );
}
