"use client";

import * as React from "react";
import { adminLogout } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Library,
  GraduationCap,
  BookMarked,
  BookOpen,
  PanelLeft,
  Megaphone,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Smartphone,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dashboard } from "./dashboard";
import { MediumsManager } from "./mediums-manager";
import { ClassesManager } from "./classes-manager";
import { SubjectsManager } from "./subjects-manager";
import { BooksManager } from "./books-manager";
import { SidebarManager } from "./sidebar-manager";
import { BottomNavManager } from "./bottomnav-manager";
import { SplashManager } from "./splash-manager";
import { AdsManager } from "./ads-manager";
import { NotificationsManager } from "./notifications-manager";
import { SettingsManager } from "./settings-manager";

export type AdminSection =
  | "dashboard"
  | "mediums"
  | "classes"
  | "subjects"
  | "books"
  | "sidebar"
  | "bottomnav"
  | "splash"
  | "ads"
  | "notifications"
  | "settings";

const NAV: {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "डैशबोर्ड", icon: LayoutDashboard },
  { id: "mediums", label: "माध्यम", icon: Library },
  { id: "classes", label: "कक्षाएँ", icon: GraduationCap },
  { id: "subjects", label: "विषय", icon: BookMarked },
  { id: "books", label: "बुक्स / नोट्स", icon: BookOpen },
  { id: "sidebar", label: "साइडबार मेन्यू", icon: PanelLeft },
  { id: "bottomnav", label: "बॉटम नेविगेशन", icon: Smartphone },
  { id: "splash", label: "स्प्लैश स्लाइड्स", icon: ImageIcon },
  { id: "ads", label: "विज्ञापन", icon: Megaphone },
  { id: "notifications", label: "नोटिफिकेशन", icon: Bell },
  { id: "settings", label: "एप सेटिंग्स", icon: SettingsIcon },
];

export function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = React.useState<AdminSection>("dashboard");
  const setMode = useAppStore((s) => s.setMode);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const current = NAV.find((n) => n.id === section) ?? NAV[0];

  // Return to the user app by clearing the secret #admin hash.
  function goToApp() {
    if (typeof window !== "undefined") {
      window.history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search
      );
    }
    setMode("app");
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminLogout();
      toast.success("लॉगआउट हो गया");
      onLogout();
    } catch {
      toast.error("लॉगआउट विफल");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-49px)] w-full flex-col bg-muted/30 lg:flex-row">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            CG
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-[11px] text-muted-foreground">Content Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = section === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="space-y-2 border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={goToApp}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            यूज़र ऐप देखें
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            लॉगआउट
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="border-b bg-background lg:hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              CG
            </div>
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToApp}>
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> ऐप
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loggingOut}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="px-3 pb-2.5">
          <Select value={section} onValueChange={(v) => setSection(v as AdminSection)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <current.icon className="h-4 w-4" />
                  <span>{current.label}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {NAV.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  <span className="flex items-center gap-2">
                    <n.icon className="h-4 w-4" />
                    <span>{n.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
          {section === "dashboard" && <Dashboard onNavigate={setSection} />}
          {section === "mediums" && <MediumsManager />}
          {section === "classes" && <ClassesManager />}
          {section === "subjects" && <SubjectsManager />}
          {section === "books" && <BooksManager />}
          {section === "sidebar" && <SidebarManager />}
          {section === "bottomnav" && <BottomNavManager />}
          {section === "splash" && <SplashManager />}
          {section === "ads" && <AdsManager />}
          {section === "notifications" && <NotificationsManager />}
          {section === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}
