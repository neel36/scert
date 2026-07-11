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
  const book = await db.book.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title) : undefined,
      description: body.description !== undefined ? (body.description ? String(body.description) : null) : undefined,
      type: body.type !== undefined ? String(body.type) : undefined,
      coverUrl: body.coverUrl !== undefined ? (body.coverUrl ? String(body.coverUrl) : null) : undefined,
      pdfUrl: body.pdfUrl !== undefined ? String(body.pdfUrl) : undefined,
      fileSize: body.fileSize !== undefined ? Number(body.fileSize) : undefined,
      pages: body.pages !== undefined ? Number(body.pages) : undefined,
      author: body.author !== undefined ? (body.author ? String(body.author) : null) : undefined,
      icon: body.icon !== undefined ? (body.icon ? String(body.icon) : null) : undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
      subjectId: body.subjectId !== undefined ? String(body.subjectId) : undefined,
    },
  });
  return NextResponse.json({ book });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const g = await guardAdmin();
  if (g) return g;
  const { id } = await params;
  await db.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
