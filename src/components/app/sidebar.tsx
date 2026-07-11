"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/stores/app-store";
import { getIcon } from "@/lib/icons";
import type { SidebarItem } from "@/lib/types";
import { BookOpen, ExternalLink, LogOut } from "lucide-react";

interface AppSidebarProps {
  items: SidebarItem[];
  appName: string;
}

export function AppSidebar({ items, appName }: AppSidebarProps) {
  const open = useAppStore((s) => s.sidebarOpen);
  const setOpen = useAppStore((s) => s.setSidebarOpen);
  const setScreen = useAppStore((s) => s.setScreen);

  const handle = (item: SidebarItem) => {
    setOpen(false);
    if (item.linkType === "external") {
      window.open(item.linkValue, "_blank", "noopener,noreferrer");
      return;
    }
    // screen navigation
    setScreen(item.linkValue as any);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="gap-0 border-b bg-gradient-to-br from-emerald-600 to-teal-700 p-0 text-left text-white">
          <div className="flex items-center gap-3 px-5 py-5">
            <img
              src="/app-icon.png"
              alt="CG"
              className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/30"
            />
            <div className="min-w-0">
              <SheetTitle className="text-base font-bold text-white">
                {appName}
              </SheetTitle>
              <p className="text-[11px] text-white/80">CG Board • Books & Notes</p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {items.map((item) => {
            const Icon = getIcon(item.icon);
            const isExternal = item.linkType === "external";
            return (
              <button
                key={item.id}
                onClick={() => handle(item)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-primary/10">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isExternal ? (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-3">
          <button
            onClick={() => {
              setOpen(false);
              setScreen("exit");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50">
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            एक्जिट
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { BookOpen };
