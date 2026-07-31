"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Bell, RefreshCw, Loader2 } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useLibraryStore } from "@/stores/library-store";
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
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// PDF reader is heavy + uses browser APIs; load it only when needed.
const PdfReader = dynamic(
  () => import("./pdf-reader").then((m) => m.default),
  { ssr: false }
);

import { App as CapacitorApp } from "@capacitor/app";

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

  const [bypassOffline, setBypassOffline] = useState(false);
  const downloads = useLibraryStore((s) => s.downloads);
  const setReaderBook = useLibraryStore((s) => s.setReaderBook);
  const hasDownloads = downloads.length > 0;

  // Hardware Back Button handler (Android back button)
  useEffect(() => {
    let backListener: any;
    const setupBackHandler = async () => {
      try {
        backListener = await CapacitorApp.addListener("backButton", () => {
          const state = useAppStore.getState();
          const libState = useLibraryStore.getState();

          if (libState.readerBook) {
            libState.setReaderBook(null);
          } else if (state.sidebarOpen) {
            state.setSidebarOpen(false);
          } else if (state.screen === "home") {
            if (state.selectedSubjectId) {
              state.selectSubject(null);
            } else if (state.selectedClassId) {
              state.selectClass(null);
            } else if (state.selectedMediumId) {
              state.selectMedium(null);
            } else {
              state.setScreen("exit");
            }
          } else if (state.screen !== "home") {
            state.setScreen("home");
          } else {
            state.setScreen("exit");
          }
        });
      } catch (e) {
        console.log("Capacitor backButton listener not available on web", e);
      }
    };
    setupBackHandler();
    return () => {
      if (backListener && typeof backListener.remove === "function") {
        backListener.remove();
      }
    };
  }, []);

  // Internet connectivity gate
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      reload(); // Auto-sync admin panel updates into local offline cache
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOnline, reload]);

  const appName = config?.settings?.app_name || "BOOKS AND NOTES CG BOARD";
  const requireInternet = config?.settings?.require_internet !== "false";
  const primaryColor = config?.settings?.primary_color || "#059669";

  const handleOfflineBypass = () => {
    setBypassOffline(true);
    setScreen("library");
  };

  // Mock config for offline settings screen fallback
  const mockConfig = {
    settings: {
      app_name: appName,
      version: config?.settings?.version || "1.0.0",
    },
    splashSlides: [],
    sidebar: [],
    bottomNav: [],
    adConfig: null,
    notificationConfig: null,
  } as any;

  const bottomNavItems = config?.bottomNav || [
    { id: "home", label: "होम", icon: "Home", screen: "home", active: true, order: 0 },
    { id: "library", label: "लाइब्रेरी", icon: "Library", screen: "library", active: true, order: 1 },
    { id: "bookmarks", label: "बुकमार्क", icon: "Bookmark", screen: "bookmarks", active: true, order: 2 },
    { id: "settings", label: "सेटिंग्स", icon: "Settings", screen: "settings", active: true, order: 3 },
  ];

  // ---- No internet gate (before app opens) ----
  if (requireInternet && !online && !content && !bypassOffline) {
    return (
      <PhoneFrame>
        <NoInternetPopup
          onRetry={() => {
            if (typeof navigator !== "undefined") setOnline(navigator.onLine);
            reload();
          }}
          onOfflineRead={hasDownloads ? handleOfflineBypass : undefined}
        />
      </PhoneFrame>
    );
  }
  // Data failed to load
  if (error && !content && !bypassOffline) {
    return (
      <PhoneFrame>
        <NoInternetPopup
          onRetry={reload}
          onOfflineRead={hasDownloads ? handleOfflineBypass : undefined}
        />
      </PhoneFrame>
    );
  }

  // ---- Splash screen (first open) ----
  if (!splashDone && !bypassOffline) {
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
      {/* Inject Dynamic Primary Color Theme Customization */}
      <style>{`
        :root {
          --primary: ${primaryColor} !important;
        }
      `}</style>

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
      <main className="relative flex-1 overflow-y-auto px-3 py-3 font-sans">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {screen === "home" && (
              content ? (
                <HomeScreen content={content} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 p-4 text-emerald-600">
                    <RefreshCw className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold">डेटा लोड हो रहा है / ऑफ़लाइन मोड</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    सामग्री लोड करने के लिए एक बार इंटरनेट कनेक्ट करें। उसके बाद सभी बुक्स और सब्जेक्ट्स ऑफ़लाइन उपलब्ध रहेंगे।
                  </p>
                  <Button size="sm" onClick={reload} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <RefreshCw className="h-3.5 w-3.5" /> रिफ्रेश करें
                  </Button>
                </div>
              )
            )}
            {screen === "library" && <MyLibrary />}
            {screen === "bookmarks" && <BookmarksScreen />}
            {screen === "downloads" && <DownloadsScreen />}
            {screen === "settings" && <SettingsScreen config={config || mockConfig} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <BottomNav items={bottomNavItems} />

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
