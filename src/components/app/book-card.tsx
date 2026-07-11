"use client";

import { motion } from "framer-motion";
import { Download, BookOpen, Loader2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLibraryStore } from "@/stores/library-store";
import { useAppStore } from "@/stores/app-store";
import { registerDownload } from "@/lib/api";
import type { BookWithPath } from "@/lib/types";

interface BookCardProps {
  book: BookWithPath;
  showPath?: boolean;
}

const typeBadge: Record<string, { label: string; cls: string }> = {
  book: { label: "बुक", cls: "bg-emerald-100 text-emerald-700" },
  notes: { label: "नोट्स", cls: "bg-amber-100 text-amber-700" },
  other: { label: "अन्य", cls: "bg-violet-100 text-violet-700" },
};

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function BookCard({ book, showPath = false }: BookCardProps) {
  const isDownloaded = useLibraryStore((s) => s.isDownloaded(book.id));
  const task = useLibraryStore((s) => s.tasks[book.id]);
  const startDownload = useLibraryStore((s) => s.startDownload);
  const removeDownload = useLibraryStore((s) => s.removeDownload);
  const openReader = useAppStore((s) => s.openReader);
  const bumpAction = useAppStore((s) => s.bumpAction);

  const isDownloading = task?.status === "downloading";
  const badge = typeBadge[book.type] ?? typeBadge.book;

  const handleDownload = () => {
    startDownload(book, () => {
      registerDownload(book.id);
    });
  };

  const handleRead = () => {
    openReader(book);
    bumpAction();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* cover */}
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-2xl">
            {book.icon || "📘"}
          </div>
        )}
        <span
          className={
            "absolute left-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold " +
            badge.cls
          }
        >
          {badge.label}
        </span>
      </div>

      {/* info */}
      <div className="flex min-w-0 flex-1 flex-col">
        {showPath && (
          <p className="truncate text-[10px] text-muted-foreground">
            {book.mediumName} • {book.className} • {book.subjectName}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {book.title}
        </h3>
        {book.author && (
          <p className="truncate text-[11px] text-muted-foreground">{book.author}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
          {book.pages ? <span>{book.pages} पृष्ठ</span> : null}
          {book.fileSize ? <span>• {formatSize(book.fileSize)}</span> : null}
          <span>• ↓ {book.downloads}</span>
        </div>
      </div>

      {/* action */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-1">
        {isDownloaded ? (
          <>
            <Button
              size="sm"
              onClick={handleRead}
              className="gap-1.5 rounded-full bg-primary text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" /> रीड बुक
            </Button>
            <button
              onClick={() => removeDownload(book.id)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-rose-500"
            >
              <Trash2 className="h-3 w-3" /> हटाएं
            </button>
          </>
        ) : isDownloading ? (
          <div className="flex w-full flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              {Math.round(task?.progress ?? 0)}%
            </div>
            <Progress value={task?.progress ?? 0} className="h-1.5 w-20" />
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="gap-1.5 rounded-full"
          >
            <Download className="h-4 w-4" /> डाउनलोड
          </Button>
        )}
      </div>

      {isDownloaded && (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-background">
          <Check className="h-3 w-3" />
        </span>
      )}
    </motion.div>
  );
}
