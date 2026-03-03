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

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Brand Intelligence Layer", href: "/brand-intelligence", icon: Brain },
  { name: "Script Review & Correction", href: "/script-review", icon: ClipboardCheck },
  { name: "Script Generation", href: "/script-generation", icon: Film },
  { name: "Video Brief System", href: "/video-briefs", icon: Video },
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
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-gray-800">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: brandColor || "#6366f1" }}
        >
          {brandName.charAt(0)}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {brandName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        {userEmail && (
          <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">
            {userEmail}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
