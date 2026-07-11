import { db } from "@/lib/db";
import { cookies } from "next/headers";

const SESSION_COOKIE = "cg_admin_session";
const SESSION_TOKEN = "cg-board-admin-authenticated";

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await db.appSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = await getSetting("admin_password", "admin123");
  return password === adminPassword;
}

export async function createAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token === SESSION_TOKEN;
}
