import type {
  AppConfig,
  ContentTree,
  BookType,
} from "@/lib/types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || res.statusText);
  }
  return res.json() as Promise<T>;
}

import {
  getCachedAppConfig,
  setCachedAppConfig,
  getCachedContent,
  setCachedContent,
} from "@/lib/offline-storage";

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const data = await json<AppConfig>(
      await fetch("/api/app/config", { cache: "no-store" })
    );
    setCachedAppConfig(data);
    return data;
  } catch (err) {
    const cached = getCachedAppConfig();
    if (cached) return cached;
    throw err;
  }
}

export async function fetchContent(): Promise<ContentTree> {
  try {
    const data = await json<ContentTree>(
      await fetch("/api/app/content", { cache: "no-store" })
    );
    setCachedContent(data);
    return data;
  } catch (err) {
    const cached = getCachedContent();
    if (cached) return cached;
    throw err;
  }
}

export async function registerDownload(bookId: string): Promise<void> {
  await fetch(`/api/app/books/${bookId}/download`, { method: "POST" }).catch(() => {});
}

// ---- Admin API client ----
export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/auth", { method: "DELETE" });
}

export async function adminCheck(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    return !!data.authenticated;
  } catch {
    return false;
  }
}

export async function adminRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return json<T>(res);
}

export const BOOK_TYPES: { value: BookType; label: string; icon: string }[] = [
  { value: "book", label: "बुक्स", icon: "📕" },
  { value: "notes", label: "नोट्स", icon: "📝" },
  { value: "other", label: "अन्य", icon: "📂" },
];
