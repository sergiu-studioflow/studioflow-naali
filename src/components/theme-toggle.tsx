"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5">
        <div className="h-6 w-6" />
        <div className="h-6 w-6" />
        <div className="h-6 w-6" />
      </div>
    );
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-secondary p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150",
            theme === value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={label}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
