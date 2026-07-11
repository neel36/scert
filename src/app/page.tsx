"use client";

import { useAppStore } from "@/stores/app-store";
import { UserApp } from "@/components/app/user-app";
import { lazy, Suspense, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const AdminPanel = lazy(() =>
  import("@/components/admin/admin-panel").then((m) => ({ default: m.AdminPanel }))
);

// The admin panel is hidden from regular users. It is reachable only via the
// secret URL hash "#admin" (e.g. https://yourapp/#admin). The public UI never
// exposes a link to it.
const ADMIN_HASH = "#admin";

function readAdminFromHash(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash.toLowerCase() === ADMIN_HASH;
}

export default function Home() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  // Sync mode with the URL hash on mount and whenever the hash changes.
  useEffect(() => {
    setMode(readAdminFromHash() ? "admin" : "app");
    const onHashChange = () => {
      setMode(readAdminFromHash() ? "admin" : "app");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [setMode]);

  // Admin mode: standalone full-screen CMS with a discreet "back to app" bar.
  if (mode === "admin") {
    return (
      <div className="min-h-screen w-full bg-muted/40 flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src="/app-icon.png"
                alt="CG Board"
                className="h-8 w-8 rounded-lg object-cover shadow-sm"
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">
                  Admin Control Panel
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  BOOKS AND NOTES CG BOARD
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  // Clear the hash and return to the user app.
                  history.pushState(
                    "",
                    document.title,
                    window.location.pathname + window.location.search
                  );
                  setMode("app");
                }
              }}
              className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              यूज़र ऐप
            </button>
          </div>
        </div>

        <div className="flex-1">
          <Suspense
            fallback={
              <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
                Admin Panel load ho raha hai…
              </div>
            }
          >
            <AdminPanel />
          </Suspense>
        </div>
      </div>
    );
  }

  // User app: NO admin button, NO hint that an admin panel exists.
  return (
    <div className="min-h-screen w-full bg-muted/40 flex flex-col">
      <UserApp />
    </div>
  );
}
