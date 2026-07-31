import type { AppConfig, ContentTree } from "@/lib/types";

const APP_CONFIG_CACHE_KEY = "scert_offline_app_config";
const CONTENT_TREE_CACHE_KEY = "scert_offline_content_tree";
const LAST_SYNC_KEY = "scert_offline_last_sync";

export function getCachedAppConfig(): AppConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APP_CONFIG_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedAppConfig(config: AppConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APP_CONFIG_CACHE_KEY, JSON.stringify(config));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to cache AppConfig", e);
  }
}

export function getCachedContent(): ContentTree | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTENT_TREE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedContent(content: ContentTree): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTENT_TREE_CACHE_KEY, JSON.stringify(content));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to cache ContentTree", e);
  }
}

export function getLastSyncTime(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}
