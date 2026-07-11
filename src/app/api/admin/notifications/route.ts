import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  let config = await db.notificationConfig.findFirst();
  if (!config) {
    config = await db.notificationConfig.create({ data: {} });
  }
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const g = await guardAdmin();
  if (g) return g;
  const body = await req.json();
  let config = await db.notificationConfig.findFirst();
  const data = {
    enabled: body.enabled,
    onesignalAppId: body.onesignalAppId ?? null,
  };
  if (!config) {
    config = await db.notificationConfig.create({ data });
  } else {
    config = await db.notificationConfig.update({ where: { id: config.id }, data });
  }
  return NextResponse.json({ config });
}
