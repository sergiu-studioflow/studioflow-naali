"use client";

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
    <aside className="flex h-screen w-[260px] flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-[60px] items-center gap-3 px-6">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold text-white"
          style={{ backgroundColor: brandColor || "#171717" }}
        >
          {brandName.charAt(0)}
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {brandName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-foreground" />
              )}
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-foreground" : "text-muted-foreground/70")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-border/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Theme</span>
          <ThemeToggle />
        </div>

        {userEmail && (
          <p className="truncate text-[11px] text-muted-foreground/70">
            {userEmail}
          </p>
        )}
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
