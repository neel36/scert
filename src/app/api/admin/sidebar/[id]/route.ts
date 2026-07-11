import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guardAdmin();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const item = await db.sidebarItem.update({
    where: { id },
    data: {
      label: body.label !== undefined ? String(body.label) : undefined,
      icon: body.icon !== undefined ? String(body.icon) : undefined,
      linkType: body.linkType !== undefined ? String(body.linkType) : undefined,
      linkValue: body.linkValue !== undefined ? String(body.linkValue) : undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guardAdmin();
  if (g) return g;
  const { id } = await params;
  await db.sidebarItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
