import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const items = await db.bottomNavItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const item = await db.bottomNavItem.create({
    data: {
      label: String(body.label),
      icon: String(body.icon ?? "Home"),
      screen: String(body.screen ?? "home"),
      order: Number(body.order ?? 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json({ item });
}
