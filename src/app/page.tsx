"use client";

import { useAppStore } from "@/stores/app-store";
import { UserApp } from "@/components/app/user-app";
import { lazy, Suspense } from "react";

const AdminPanel = lazy(() =>
  import("@/components/admin/admin-panel").then((m) => ({ default: m.AdminPanel }))
);

export default function Home() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="min-h-screen w-full bg-muted/40 flex flex-col">
      {/* Top switcher bar (simulates choosing user app vs admin website) */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/app-icon.png"
              alt="CG Board"
              className="h-8 w-8 rounded-lg object-cover shadow-sm"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold">
                BOOKS AND NOTES CG BOARD
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                User App &amp; Admin Control Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs font-medium">
            <button
              onClick={() => setMode("app")}
              className={
                "rounded-full px-3 py-1.5 transition-colors " +
                (mode === "app"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              User App
            </button>
            <button
              onClick={() => setMode("admin")}
              className={
                "rounded-full px-3 py-1.5 transition-colors " +
                (mode === "admin"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {mode === "app" ? (
          <UserApp />
        ) : (
          <Suspense
            fallback={
              <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
                Admin Panel load ho raha hai…
              </div>
            }
          >
            <AdminPanel />
          </Suspense>
        )}
      </div>
    </div>
  );
}
