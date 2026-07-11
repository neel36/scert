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
  const subject = await db.subject.update({
    where: { id },
    data: {
      name: body.name !== undefined ? String(body.name) : undefined,
      icon: body.icon !== undefined ? (body.icon ? String(body.icon) : null) : undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
      classId: body.classId !== undefined ? String(body.classId) : undefined,
    },
  });
  return NextResponse.json({ subject });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guardAdmin();
  if (g) return g;
  const { id } = await params;
  await db.subject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
