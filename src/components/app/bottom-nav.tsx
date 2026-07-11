"use client";

import { useAppStore, type AppScreen } from "@/stores/app-store";
import { getIcon } from "@/lib/icons";
import type { BottomNavItem } from "@/lib/types";

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);

  // Sort by order
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-stretch justify-around px-1 py-1">
        {sorted.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive = screen === item.screen;
          const isExit = item.screen === "exit";
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.screen as AppScreen)}
              className={
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors " +
                (isExit
                  ? "text-rose-500"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <span
                className={
                  "grid h-7 w-7 place-items-center rounded-lg transition-all " +
                  (isExit
                    ? "bg-rose-50"
                    : isActive
                    ? "bg-primary/10 scale-105"
                    : "")
                }
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
