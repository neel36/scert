"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAppConfig, fetchContent } from "@/lib/api";
import type { AppConfig, ContentTree } from "@/lib/types";

interface DataState {
  config: AppConfig | null;
  content: ContentTree | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAppData(): DataState {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [content, setContent] = useState<ContentTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, ct] = await Promise.all([fetchAppConfig(), fetchContent()]);
      setConfig(c);
      setContent(ct);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { config, content, loading, error, reload };
}
