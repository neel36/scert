import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Returns ALL the app config the mobile-style app needs in a single bootstrap call:
// settings, splash slides, sidebar, bottom nav, ad config, notification config.
export async function GET() {
  const [settings, splashSlides, sidebar, bottomNav, adConfig, notifConfig] =
    await Promise.all([
      db.appSetting.findMany(),
      db.splashSlide.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      db.sidebarItem.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      db.bottomNavItem.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
      db.adConfig.findFirst(),
      db.notificationConfig.findFirst(),
    ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return NextResponse.json({
    settings: settingsMap,
    splashSlides,
    sidebar,
    bottomNav,
    adConfig,
    notificationConfig: notifConfig,
  });
}
