import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediumId = searchParams.get("mediumId");
  const classes = await db.class.findMany({
    where: mediumId ? { mediumId } : undefined,
    orderBy: { order: "asc" },
    include: { _count: { select: { subjects: true } }, medium: true },
  });
  return NextResponse.json({ classes });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const cls = await db.class.create({
    data: {
      name: String(body.name),
      code: String(body.code),
      icon: body.icon ? String(body.icon) : null,
      order: Number(body.order ?? 0),
      active: body.active !== false,
      mediumId: String(body.mediumId),
    },
  });
  return NextResponse.json({ class: cls });
}
