"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Bell, RefreshCw, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useAppData } from "@/hooks/use-app-data";
import { SplashScreen } from "./splash-screen";
import { NoInternetPopup } from "./no-internet-popup";
import { AppSidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { HomeScreen } from "./home-screen";
import { MyLibrary } from "./my-library";
import { BookmarksScreen } from "./bookmarks-screen";
import { DownloadsScreen } from "./downloads-screen";
import { SettingsScreen } from "./settings-screen";
import { ExitDialog } from "./exit-dialog";
import dynamic from "next/dynamic";

// PDF reader is heavy + uses browser APIs; load it only when needed.
const PdfReader = dynamic(
  () => import("./pdf-reader").then((m) => m.default),
  { ssr: false }
);

export function UserApp() {
  const {
    config,
    content,
    loading,
    error,
    reload,
  } = useAppData();

  const {
    splashDone,
    setSplashDone,
    online,
    setOnline,
    screen,
    setScreen,
    sidebarOpen,
    setSidebarOpen,
    readerBook,
  } = useAppStore();

  // Internet connectivity gate (required to OPEN the app)
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnline]);

  const appName = config?.settings?.app_name || "BOOKS AND NOTES CG BOARD";
  const requireInternet = config?.settings?.require_internet !== "false";

  // ---- No internet gate (before app opens) ----
  if (requireInternet && !online && !content) {
    return <PhoneFrame><NoInternetPopup onRetry={() => {
      if (typeof navigator !== "undefined") setOnline(navigator.onLine);
      reload();
    }} /></PhoneFrame>;
  }
  // Data failed to load
  if (error && !content) {
    return (
      <PhoneFrame>
        <NoInternetPopup onRetry={reload} />
      </PhoneFrame>
    );
  }

  // ---- Splash screen (first open) ----
  if (!splashDone) {
    if (loading || !config) {
      return (
        <PhoneFrame>
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-600 to-teal-800 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </PhoneFrame>
      );
    }
    return (
      <PhoneFrame>
        <SplashScreen
          slides={config.splashSlides}
          appName={appName}
          onDone={() => setSplashDone(true)}
        />
      </PhoneFrame>
    );
  }

  // ---- Main app ----
  return (
    <PhoneFrame>
      <AppSidebar items={config?.sidebar ?? []} appName={appName} />

      {/* Top bar */}
      <header className="relative z-20 flex items-center gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <button
          onClick={() => setSidebarOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
          aria-label="मेन्यू"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <img
            src="/app-icon.png"
            alt="CG"
            className="h-7 w-7 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">
              {appName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              CG Board • Books &amp; Notes
            </p>
          </div>
        </div>
        <button
          onClick={() => setScreen("downloads")}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
          aria-label="सूचनाएं"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Offline banner (after open, if connection drops) */}
      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center gap-2 bg-amber-500 py-1 text-center text-[11px] font-medium text-white"
          >
            <RefreshCw className="h-3 w-3" /> ऑफलाइन मोड • डाउनलोड की गई किताबें उपलब्ध
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <main className="relative flex-1 overflow-y-auto px-3 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {screen === "home" && content && <HomeScreen content={content} />}
            {screen === "library" && <MyLibrary />}
            {screen === "bookmarks" && <BookmarksScreen />}
            {screen === "downloads" && <DownloadsScreen />}
            {screen === "settings" && config && <SettingsScreen config={config} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      {config?.bottomNav && <BottomNav items={config.bottomNav} />}

      {/* Reader overlay */}
      <AnimatePresence>
        {readerBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100]"
          >
            <PdfReader book={readerBook} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit dialog */}
      <ExitDialog
        open={screen === "exit"}
        onOpenChange={(v) => {
          if (!v) setScreen("home");
        }}
      />
    </PhoneFrame>
  );
}

// ---------- Phone frame wrapper ----------
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center px-0 py-0 md:px-4 md:py-6">
      <div className="relative flex h-[100dvh] w-full max-w-[460px] flex-col overflow-hidden bg-background md:h-[88vh] md:rounded-[2.2rem] md:border md:shadow-2xl md:ring-1 md:ring-black/5">
        {children}
      </div>
    </div>
  );
}
