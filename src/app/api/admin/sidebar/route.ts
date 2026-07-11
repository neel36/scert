import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const items = await db.sidebarItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const item = await db.sidebarItem.create({
    data: {
      label: String(body.label),
      icon: String(body.icon ?? "Menu"),
      linkType: String(body.linkType ?? "screen"),
      linkValue: String(body.linkValue ?? "home"),
      order: Number(body.order ?? 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json({ item });
}

// Bulk reorder
export async function PUT(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = (await req.json()) as { items: { id: string; order: number }[] };
  for (const it of body.items) {
    await db.sidebarItem.update({ where: { id: it.id }, data: { order: it.order } });
  }
  return NextResponse.json({ ok: true });
}
