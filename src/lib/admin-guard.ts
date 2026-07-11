import { isAdminAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function guardAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
