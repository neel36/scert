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

export async function fetchAppConfig(): Promise<AppConfig> {
  return json(await fetch("/api/app/config", { cache: "no-store" }));
}

export async function fetchContent(): Promise<ContentTree> {
  return json(await fetch("/api/app/content", { cache: "no-store" }));
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
