import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const slides = await db.splashSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  const slide = await db.splashSlide.create({
    data: {
      imageUrl: String(body.imageUrl),
      title: body.title ? String(body.title) : null,
      subtitle: body.subtitle ? String(body.subtitle) : null,
      order: Number(body.order ?? 0),
      duration: Number(body.duration ?? 3000),
      active: body.active !== false,
    },
  });
  return NextResponse.json({ slide });
}
