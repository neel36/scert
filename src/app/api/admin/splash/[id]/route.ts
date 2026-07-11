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
  const slide = await db.splashSlide.update({
    where: { id },
    data: {
      imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : undefined,
      title: body.title !== undefined ? (body.title ? String(body.title) : null) : undefined,
      subtitle: body.subtitle !== undefined ? (body.subtitle ? String(body.subtitle) : null) : undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
      duration: body.duration !== undefined ? Number(body.duration) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
    },
  });
  return NextResponse.json({ slide });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guardAdmin();
  if (g) return g;
  const { id } = await params;
  await db.splashSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
