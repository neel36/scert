"use client";

import { Bookmark, Trash2, BookOpen } from "lucide-react";
import { useLibraryStore } from "@/stores/library-store";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";

export function BookmarksScreen() {
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const downloads = useLibraryStore((s) => s.downloads);
  const removeBookmark = useLibraryStore((s) => s.removeBookmark);
  const openReader = useAppStore((s) => s.openReader);

  // join bookmarks with downloaded book info
  const items = bookmarks
    .map((b) => {
      const book = downloads.find((d) => d.id === b.bookId);
      return book ? { ...b, book } : null;
    })
    .filter(Boolean) as (typeof bookmarks[number] & {
    book: (typeof downloads)[number];
  })[];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Bookmark className="h-8 w-8" />
        </span>
        <div>
          <p className="text-sm font-semibold">कोई बुकमार्क नहीं</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            रीडर में पढ़ते समय महत्वपूर्ण पृष्ठ बुकमार्क करें।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Bookmark className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold leading-tight">बुकमार्क्स</h2>
          <p className="text-[11px] text-muted-foreground">{items.length} बुकमार्क</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600">
              <Bookmark className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{b.book.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {b.book.mediumName} • {b.book.className} • {b.label}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                openReader({
                  ...b.book,
                  description: null,
                  author: null,
                  order: 0,
                  active: true,
                  downloads: 0,
                })
              }
              className="gap-1.5 rounded-full"
            >
              <BookOpen className="h-4 w-4" /> खोलें
            </Button>
            <button
              onClick={() => removeBookmark(b.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-rose-50 hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
