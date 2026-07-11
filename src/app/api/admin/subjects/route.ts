import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const subjects = await db.subject.findMany({
    where: classId ? { classId } : undefined,
    orderBy: { order: "asc" },
    include: { _count: { select: { books: true } }, class: true },
  });
  return NextResponse.json({ subjects });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const subject = await db.subject.create({
    data: {
      name: String(body.name),
      icon: body.icon ? String(body.icon) : null,
      order: Number(body.order ?? 0),
      active: body.active !== false,
      classId: String(body.classId),
    },
  });
  return NextResponse.json({ subject });
}
