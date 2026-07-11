import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const mediums = await db.medium.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { classes: true } } },
  });
  return NextResponse.json({ mediums });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const medium = await db.medium.create({
    data: {
      name: String(body.name),
      code: String(body.code),
      icon: body.icon ? String(body.icon) : null,
      color: body.color ? String(body.color) : null,
      order: Number(body.order ?? 0),
      active: body.active !== false,
    },
  });
  return NextResponse.json({ medium });
}
