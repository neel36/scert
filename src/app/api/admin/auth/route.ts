import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth";

// GET - check current session
export async function GET() {
  const ok = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: ok });
}

// POST - login
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (!password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }
  const ok = await verifyAdminPassword(String(password));
  if (!ok) {
    return NextResponse.json({ error: "गलत पासवर्ड" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

// DELETE - logout
export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
