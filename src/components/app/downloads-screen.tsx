"use client";

import { Download, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useLibraryStore } from "@/stores/library-store";
import { Progress } from "@/components/ui/progress";

export function DownloadsScreen() {
  const tasks = useLibraryStore((s) => s.tasks);
  const removeDownload = useLibraryStore((s) => s.removeDownload);
  const downloads = useLibraryStore((s) => s.downloads);

  const active = Object.values(tasks).filter((t) => t.status === "downloading");
  const done = Object.values(tasks).filter((t) => t.status === "done");

  if (active.length === 0 && done.length === 0 && downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Download className="h-8 w-8" />
        </span>
        <div>
          <p className="text-sm font-semibold">कोई डाउनलोड नहीं</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            डाउनलोड की गई किताबें यहाँ दिखेंगी।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Download className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold leading-tight">डाउनलोड्स</h2>
          <p className="text-[11px] text-muted-foreground">
            {active.length} चल रहा है • {downloads.length} पूर्ण
          </p>
        </div>
      </div>

      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold text-muted-foreground">चल रहा है</p>
          {active.map((t) => (
            <div
              key={t.bookId}
              className="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="flex-1 truncate text-sm font-medium">{t.title}</span>
                <span className="text-xs font-semibold text-primary">
                  {Math.round(t.progress)}%
                </span>
              </div>
              <Progress value={t.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold text-muted-foreground">हाल ही में पूर्ण</p>
          {done.slice(0, 5).map((t) => (
            <div
              key={t.bookId}
              className="flex items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="flex-1 truncate text-sm font-medium">{t.title}</span>
              <button
                onClick={() => removeDownload(t.bookId)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
