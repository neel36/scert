import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const type = searchParams.get("type");
  const books = await db.book.findMany({
    where: {
      ...(subjectId ? { subjectId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { order: "asc" },
    include: { subject: { include: { class: { include: { medium: true } } } } },
  });
  return NextResponse.json({ books });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const book = await db.book.create({
    data: {
      title: String(body.title),
      description: body.description ? String(body.description) : null,
      type: String(body.type ?? "book"),
      coverUrl: body.coverUrl ? String(body.coverUrl) : null,
      pdfUrl: String(body.pdfUrl),
      fileSize: body.fileSize ? Number(body.fileSize) : null,
      pages: body.pages ? Number(body.pages) : null,
      author: body.author ? String(body.author) : null,
      icon: body.icon ? String(body.icon) : null,
      order: Number(body.order ?? 0),
      active: body.active !== false,
      subjectId: String(body.subjectId),
    },
  });
  return NextResponse.json({ book });
}
