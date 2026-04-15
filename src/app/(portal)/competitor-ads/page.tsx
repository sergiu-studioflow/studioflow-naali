"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Music, Instagram, LayoutGrid, Users } from "lucide-react";
import type { CompetitorSource } from "@/lib/types";
import { CompetitorManagementTab } from "@/components/competitor-ads/competitor-management-tab";
import { AdLibraryTab } from "@/components/competitor-ads/ad-library-tab";

import { ProfileManagement } from "@/components/organic-content/profile-management";
import { PostGallery } from "@/components/organic-content/post-gallery";

export default function CompetitorResearchPage() {
  const [sources, setSources] = useState<CompetitorSource[]>([]);
  const [tiktokViewProfileId, setTiktokViewProfileId] = useState<number | null>(null);
  const [instagramViewProfileId, setInstagramViewProfileId] = useState<number | null>(null);
  const [tiktokSubTab, setTiktokSubTab] = useState("library");
  const [instagramSubTab, setInstagramSubTab] = useState("library");

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch("/api/competitor-sources");
      const data = await res.json();
      setSources(data);
    } catch (err) {
      console.error("Failed to load competitor sources:", err);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Competitor Research System
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Track and analyze competitor content across Meta, TikTok, Instagram, and Facebook.
        </p>
      </div>

      {/* Primary platform tabs */}
      <Tabs defaultValue="meta-ads" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="meta-ads" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Meta Ads
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            TikTok
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </TabsTrigger>
        </TabsList>

        {/* ── Meta Ads ── */}
        <TabsContent value="meta-ads" className="mt-6">
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Competitors
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <AdLibraryTab sources={sources} onSourcesRefresh={loadSources} />
            </TabsContent>
            <TabsContent value="competitors" className="mt-4">
              <CompetitorManagementTab sources={sources} onRefresh={loadSources} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── TikTok ── */}
        <TabsContent value="tiktok" className="mt-6">
          <Tabs value={tiktokSubTab} onValueChange={setTiktokSubTab} className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Competitors
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <PostGallery platform="tiktok" initialProfileId={tiktokViewProfileId} />
            </TabsContent>
            <TabsContent value="competitors" className="mt-4">
              <ProfileManagement
                platform="tiktok"
                onViewPosts={(id) => {
                  setTiktokViewProfileId(id);
                  setTiktokSubTab("library");
                }}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── Instagram ── */}
        <TabsContent value="instagram" className="mt-6">
          <Tabs value={instagramSubTab} onValueChange={setInstagramSubTab} className="w-full">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Library
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Competitors
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <PostGallery platform="instagram" initialProfileId={instagramViewProfileId} />
            </TabsContent>
            <TabsContent value="competitors" className="mt-4">
              <ProfileManagement
                platform="instagram"
                onViewPosts={(id) => {
                  setInstagramViewProfileId(id);
                  setInstagramSubTab("library");
                }}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

      </Tabs>
    </div>
  );
}
