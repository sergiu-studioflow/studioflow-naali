"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  ClipboardCheck,
  Film,
  Video,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Brand Intelligence", href: "/brand-intelligence", icon: Brain },
  { name: "Script Review", href: "/script-review", icon: ClipboardCheck },
  { name: "Script Generation", href: "/script-generation", icon: Film },
  { name: "Video Briefs", href: "/video-briefs", icon: Video },
];

type PortalSidebarProps = {
  brandName: string;
  brandColor?: string;
  features?: Record<string, boolean>;
  userEmail?: string;
};

export function PortalSidebar({ brandName, brandColor, features, userEmail }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredNav = navigation;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-sidebar">
      {/* Logo Section — StudioFlow × Naali */}
      <div className="flex h-[80px] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="group/sf rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(178,255,0,0.25)]">
            <Image
              src="/studioflow-logo.png"
              alt="StudioFlow"
              width={40}
              height={40}
              className="rounded-xl transition-all duration-200 group-hover/sf:brightness-110"
            />
          </div>
          <span className="text-sm font-light text-sidebar-muted">×</span>
          <div className="group/na rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(255,200,50,0.25)]">
            <Image
              src="/naali-logo.png"
              alt="Naali"
              width={40}
              height={40}
              className="rounded-xl transition-all duration-200 group-hover/na:brightness-110"
            />
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-active text-black shadow-xs"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-white/10"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">Theme</span>
          <ThemeToggle variant="sidebar" />
        </div>

        {userEmail && (
          <p className="truncate text-[11px] text-sidebar-muted">
            {userEmail}
          </p>
        )}
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-sidebar-muted transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-sidebar-muted transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
