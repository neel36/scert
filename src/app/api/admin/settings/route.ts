import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";
import { getSetting, setSetting } from "@/lib/auth";

export async function GET() {
  const rows = await db.appSetting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = (await req.json()) as Record<string, string>;
  // Special handling for password change
  if (body.admin_password !== undefined) {
    const current = await getSetting("admin_password", "admin123");
    if (body.admin_password !== current && body.current_password && body.current_password !== current) {
      return NextResponse.json({ error: "वर्तमान पासवर्ड गलत है" }, { status: 400 });
    }
    if (!body.admin_password) {
      return NextResponse.json({ error: "पासवर्ड खाली नहीं हो सकता" }, { status: 400 });
    }
  }
  const { current_password, ...toSet } = body;
  for (const [key, value] of Object.entries(toSet)) {
    await setSetting(key, String(value));
  }
  const rows = await db.appSetting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}
