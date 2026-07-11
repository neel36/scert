"use client";

import * as pdfjsLib from "pdfjs-dist";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  RenderTask,
  PDFPageProxy,
} from "pdfjs-dist";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookMarked,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Loader2,
  Moon,
  Plus,
  RefreshCw,
  Rows2,
  StickyNote,
  Sun,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/stores/library-store";
import { useAppStore } from "@/stores/app-store";
import type { Bookmark as BookmarkType, Note as NoteType } from "@/lib/types";

// Configure the PDF.js worker from a CDN that matches the installed version.
// Doing this at module scope (rather than inside the component) avoids
// re-setting it on every render and works in both dev and prod builds.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PdfReaderProps {
  book: {
    id: string;
    title: string;
    pdfUrl: string;
    pages?: number | null;
    coverUrl?: string | null;
  };
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.15;

// Note color palette — kept warm/green-pink to respect the "no indigo/blue"
// design guideline. Values are used both for the picker swatch and for the
// left-border accent on each note card.
const NOTE_COLORS: { name: string; value: string }[] = [
  { name: "amber", value: "#f59e0b" },
  { name: "emerald", value: "#10b981" },
  { name: "rose", value: "#f43f5e" },
  { name: "teal", value: "#14b8a6" },
  { name: "orange", value: "#f97316" },
];

/* -------------------------------------------------------------------------- */
/*  PdfCanvas — renders a single page to a <canvas>, lazily on scroll.        */
/* -------------------------------------------------------------------------- */

interface PdfCanvasProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  nightMode: boolean;
  eager?: boolean;
  className?: string;
}

function PdfCanvas({
  pdf,
  pageNumber,
  scale,
  nightMode,
  eager = false,
  className,
}: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  // For "eager" pages (current page in horizontal mode) we render immediately;
  // for the rest we render lazily when an IntersectionObserver fires.
  const [lazyRendered, setLazyRendered] = useState<boolean>(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const shouldRender = eager || lazyRendered;

  // Fetch unscaled page dimensions once so we can reserve layout space before
  // the (lazily-triggered) render kicks in. This keeps scroll height stable.
  useEffect(() => {
    let cancelled = false;
    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;
        const vp = page.getViewport({ scale: 1 });
        setDims({ w: vp.width, h: vp.height });
      })
      .catch(() => {
        /* ignore — placeholder will remain until render */
      });
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  // Trigger render when the page scrolls near the viewport. Eager pages skip
  // the observer entirely (they render on mount via `shouldRender` above).
  useEffect(() => {
    if (eager) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setLazyRendered(true);
        }
      },
      { root: null, rootMargin: "1200px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  // Render the page whenever the canvas becomes visible, the scale changes,
  // or the page number changes. Cancels any in-flight render first.
  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    let pageProxy: PDFPageProxy | null = null;

    pdf
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;
        pageProxy = page;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
        canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            /* noop */
          }
        }
        const task = page.render({
          canvasContext: ctx,
          viewport,
          transform,
        });
        renderTaskRef.current = task;
        task.promise.catch(() => {
          /* RenderingCancelledException is expected on rapid re-renders */
        });
      })
      .catch(() => {
        /* ignore — page fetch failed */
      });

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          /* noop */
        }
        renderTaskRef.current = null;
      }
    };
  }, [shouldRender, pdf, pageNumber, scale]);

  const width = dims ? dims.w * scale : undefined;
  const height = dims ? dims.h * scale : undefined;

  return (
    <div
      ref={containerRef}
      data-page-number={pageNumber}
      className={cn(
        "relative overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/5",
        nightMode && "ring-white/10",
        className
      )}
      style={
        dims
          ? { width, height }
          : { width: "min(100%, 760px)", aspectRatio: "1 / 1.414", minHeight: 360 }
      }
    >
      {shouldRender ? (
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            filter: nightMode ? "invert(1) hue-rotate(180deg)" : undefined,
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
          <Loader2 className="h-7 w-7 animate-spin opacity-60" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PageJumpInput — small controlled input that commits on Enter / blur.      */
/* -------------------------------------------------------------------------- */

function PageJumpInput({
  value,
  max,
  onJump,
}: {
  value: number;
  max: number;
  onJump: (p: number) => void;
}) {
  const [text, setText] = useState<string>(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);
  return (
    <Input
      type="number"
      min={1}
      max={max}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = parseInt(text, 10);
          if (!Number.isNaN(v)) onJump(v);
          (e.target as HTMLInputElement).blur();
        }
      }}
      onBlur={() => setText(String(value))}
      className="h-9 w-16 text-center tabular-nums"
      aria-label="Jump to page"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  BookmarksSheet — side panel listing bookmarks for the current book.       */
/* -------------------------------------------------------------------------- */

interface BookmarksSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookmarks: BookmarkType[];
  currentPage: number;
  onJump: (page: number) => void;
  onRemove: (id: string) => void;
}

function BookmarksSheet({
  open,
  onOpenChange,
  bookmarks,
  currentPage,
  onJump,
  onRemove,
}: BookmarksSheetProps) {
  const sorted = useMemo(
    () => [...bookmarks].sort((a, b) => a.page - b.page),
    [bookmarks]
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b pr-10">
          <SheetTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            बुकमार्क्स
          </SheetTitle>
          <SheetDescription>
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} saved
            for this book.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <Bookmark className="h-10 w-10 opacity-30" />
              <p>कोई बुकमार्क नहीं है।</p>
              <p className="text-xs">
                टूलबार के बुकमार्क आइकन से वर्तमान पृष्ठ को सहेजें।
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {sorted.map((bm) => (
                <li key={bm.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onJump(bm.page)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                      bm.page === currentPage && "bg-primary/5"
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                      {bm.page}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {bm.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {new Date(bm.createdAt).toLocaleString()}
                      </span>
                    </span>
                    {bm.page === currentPage && (
                      <Badge variant="outline" className="text-[10px]">
                        वर्तमान
                      </Badge>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onRemove(bm.id)}
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*  NotesSheet — side panel for adding & viewing page-attached notes.         */
/* -------------------------------------------------------------------------- */

interface NotesSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notes: NoteType[];
  currentPage: number;
  onAdd: (text: string, color: string) => void;
  onRemove: (id: string) => void;
  onJump: (page: number) => void;
}

function NotesSheet({
  open,
  onOpenChange,
  notes,
  currentPage,
  onAdd,
  onRemove,
  onJump,
}: NotesSheetProps) {
  const [text, setText] = useState<string>("");
  const [color, setColor] = useState<string>(NOTE_COLORS[0].value);

  const grouped = useMemo(() => {
    const map = new Map<number, NoteType[]>();
    for (const n of notes) {
      if (!map.has(n.page)) map.set(n.page, []);
      map.get(n.page)!.push(n);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [notes]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onAdd(t, color);
    setText("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b pr-10">
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            नोट्स
          </SheetTitle>
          <SheetDescription>
            Add a note to page {currentPage} or browse existing notes.
          </SheetDescription>
        </SheetHeader>

        {/* Add note form */}
        <div className="space-y-3 border-b p-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`पृष्ठ ${currentPage} के लिए नोट लिखें…`}
            className="min-h-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                    color === c.value
                      ? "scale-110 ring-foreground"
                      : "ring-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c.value }}
                  aria-label={`${c.name} color`}
                />
              ))}
            </div>
            <Button onClick={submit} disabled={!text.trim()} size="sm">
              <Plus className="h-4 w-4" /> जोड़ें
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <StickyNote className="h-10 w-10 opacity-30" />
              <p>कोई नोट नहीं है।</p>
              <p className="text-xs">ऊपर एक नोट लिखकर “जोड़ें” दबाएँ।</p>
            </div>
          ) : (
            <div className="space-y-4 p-3">
              {grouped.map(([page, items]) => (
                <div key={page}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <Badge variant="secondary" className="text-xs">
                      पृष्ठ {page}
                    </Badge>
                    {page === currentPage && (
                      <span className="text-[10px] text-primary">• वर्तमान</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className="group relative rounded-md border border-l-4 bg-card p-3 text-sm shadow-sm"
                        style={{ borderLeftColor: n.color }}
                      >
                        <button
                          type="button"
                          onClick={() => onJump(n.page)}
                          className="block w-full text-left"
                        >
                          <p className="whitespace-pre-wrap break-words pr-6">
                            {n.text}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => onRemove(n.id)}
                          aria-label="Remove note"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*  PdfReader — the main full-screen overlay reader.                          */
/* -------------------------------------------------------------------------- */

export default function PdfReader({ book }: PdfReaderProps) {
  // Reader settings + library actions (all persisted by the store).
  const readerSettings = useLibraryStore((s) => s.readerSettings);
  const setReaderSettings = useLibraryStore((s) => s.setReaderSettings);
  const addBookmark = useLibraryStore((s) => s.addBookmark);
  const removeBookmark = useLibraryStore((s) => s.removeBookmark);
  const addNote = useLibraryStore((s) => s.addNote);
  const removeNote = useLibraryStore((s) => s.removeNote);
  const setProgress = useLibraryStore((s) => s.setProgress);
  const getProgress = useLibraryStore((s) => s.getProgress);
  const allBookmarks = useLibraryStore((s) => s.bookmarks);
  const allNotes = useLibraryStore((s) => s.notes);

  const closeReader = useAppStore((s) => s.closeReader);

  const { zoom, scrollMode, pageTurnAnim, nightMode } = readerSettings;

  const bookmarks = useMemo(
    () => allBookmarks.filter((b) => b.bookId === book.id),
    [allBookmarks, book.id]
  );
  const notes = useMemo(
    () => allNotes.filter((n) => n.bookId === book.id),
    [allNotes, book.id]
  );

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(book.pages ?? 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadToken, setLoadToken] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const rafRef = useRef<number | null>(null);
  const restoredRef = useRef<boolean>(false);

  /* --------------------------- load the PDF --------------------------- */

  useEffect(() => {
    let cancelled = false;

    // `load` runs the full async lifecycle. State setters inside it are
    // invoked from a callback context (async function + promise chain) which
    // is the recommended pattern for syncing with external systems.
    let task: PDFDocumentLoadingTask | null = null;
    const load = async () => {
      setLoading(true);
      setError(null);
      setPdf(null);
      restoredRef.current = false;

      // Route through server-side proxy to avoid CORS issues with remote PDFs.
      const proxyUrl = `/api/pdf?url=${encodeURIComponent(book.pdfUrl)}`;
      task = pdfjsLib.getDocument({ url: proxyUrl });
      loadingTaskRef.current = task;

      try {
        const doc = await task.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setPdf(doc);
        setNumPages(doc.numPages);
        setLoading(false);

        // Restore last-read page from persisted progress.
        const prog = getProgress(book.id);
        const startPage =
          prog?.page && prog.page >= 1 && prog.page <= doc.numPages
            ? prog.page
            : 1;
        setCurrentPage(startPage);
        restoredRef.current = true;
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("PDF load error:", err);
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "Failed to load PDF.";
        setError(msg || "Failed to load PDF.");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (loadingTaskRef.current) {
        try {
          loadingTaskRef.current.destroy();
        } catch {
          /* noop */
        }
        loadingTaskRef.current = null;
      }
      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch {
          /* noop */
        }
        pdfRef.current = null;
      }
    };
    // Re-run when the URL/book changes or when the user hits "retry".
  }, [book.pdfUrl, book.id, loadToken, getProgress]);

  /* ----------------------- persist reading progress ------------------- */

  useEffect(() => {
    if (!pdf || !numPages || !restoredRef.current) return;
    setProgress({
      bookId: book.id,
      page: currentPage,
      scrollPercent: numPages > 0 ? (currentPage / numPages) * 100 : 0,
      updatedAt: Date.now(),
    });
  }, [currentPage, pdf, numPages, book.id, setProgress]);

  /* ----------- restore scroll position when entering vertical mode ---- */

  useEffect(() => {
    if (scrollMode !== "vertical" || !pdf || loading) return;
    // Wait a tick so page placeholders have reserved their height.
    const id = window.setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        `[data-page-number="${currentPage}"]`
      );
      if (target) target.scrollIntoView({ block: "start" });
    }, 120);
    return () => window.clearTimeout(id);
    // Only re-run when entering vertical mode or after (re)loading the PDF.
  }, [scrollMode, pdf, loading]);

  /* ----------------------------- navigation --------------------------- */

  const goNext = useCallback(() => {
    setCurrentPage((p) => {
      if (p < numPages) {
        setDirection(1);
        return p + 1;
      }
      return p;
    });
  }, [numPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => {
      if (p > 1) {
        setDirection(-1);
        return p - 1;
      }
      return p;
    });
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      if (!numPages) return;
      const clamped = Math.max(1, Math.min(numPages, Math.floor(page)));
      if (clamped === currentPage) return;
      setDirection(clamped > currentPage ? 1 : -1);
      setCurrentPage(clamped);
      if (scrollMode === "vertical" && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const target = container.querySelector<HTMLElement>(
          `[data-page-number="${clamped}"]`
        );
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [numPages, currentPage, scrollMode]
  );

  /* --------------- track current page in vertical scroll mode ---------- */

  const handleScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const container = scrollContainerRef.current;
      if (!container) return;
      const mid = container.scrollTop + container.clientHeight / 3;
      const els = container.querySelectorAll<HTMLElement>("[data-page-number]");
      let best = currentPage;
      let bestDelta = Infinity;
      els.forEach((el) => {
        const top = el.offsetTop;
        const delta = Math.abs(top - mid);
        if (delta < bestDelta) {
          bestDelta = delta;
          best = parseInt(el.dataset.pageNumber ?? "1", 10);
        }
      });
      if (best && best !== currentPage) setCurrentPage(best);
    });
  }, [currentPage]);

  /* ----------------------------- keyboard ----------------------------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs/textareas.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }
      if (e.key === "Escape") {
        closeReader();
      } else if (e.key === "ArrowRight" && scrollMode === "horizontal") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" && scrollMode === "horizontal") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeReader, scrollMode, goNext, goPrev]);

  /* ------------------------- bookmark / zoom toggles ------------------ */

  const isCurrentPageBookmarked = bookmarks.some(
    (b) => b.page === currentPage
  );

  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      const bm = bookmarks.find((b) => b.page === currentPage);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark({
        bookId: book.id,
        page: currentPage,
        label: `पृष्ठ ${currentPage}`,
      });
    }
  };

  const toggleNightMode = () =>
    setReaderSettings({ nightMode: !nightMode });

  const toggleScrollMode = () =>
    setReaderSettings({
      scrollMode: scrollMode === "vertical" ? "horizontal" : "vertical",
    });

  const zoomIn = () =>
    setReaderSettings({
      zoom: Math.min(MAX_ZOOM, +(zoom + ZOOM_STEP).toFixed(2)),
    });
  const zoomOut = () =>
    setReaderSettings({
      zoom: Math.max(MIN_ZOOM, +(zoom - ZOOM_STEP).toFixed(2)),
    });

  const progressPct =
    numPages > 0 ? Math.min(100, (currentPage / numPages) * 100) : 0;

  /* -------------------------------- render ---------------------------- */

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-background text-foreground",
        nightMode && "dark"
      )}
    >
      {/* Top reading-progress bar (very thin, full width) */}
      <div className="absolute inset-x-0 top-0 z-50 h-1 bg-black/5">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Toolbar */}
      <header
        className={cn(
          "z-40 flex flex-wrap items-center gap-1 border-b px-2 pt-1.5 pb-1.5 sm:px-3",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={closeReader}
              aria-label="Close reader"
            >
              <X className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Close (Esc)</TooltipContent>
        </Tooltip>

        <div className="min-w-0 flex-1 px-1">
          <h2 className="truncate text-sm font-semibold sm:text-base">
            {book.title}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {loading
              ? "लोड हो रहा है…"
              : error
                ? "त्रुटि"
                : numPages > 0
                  ? `पृष्ठ ${currentPage} / ${numPages}`
                  : ""}
          </p>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Zoom out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={zoomOut}
                disabled={loading || !!error || zoom <= MIN_ZOOM}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom out</TooltipContent>
          </Tooltip>

          <span className="hidden w-12 text-center text-xs font-medium tabular-nums sm:inline-block">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom in */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={zoomIn}
                disabled={loading || !!error || zoom >= MAX_ZOOM}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom in</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Scroll mode toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={toggleScrollMode}
                disabled={loading || !!error}
                aria-label="Toggle scroll mode"
              >
                {scrollMode === "vertical" ? (
                  <Columns2 className="h-5 w-5" />
                ) : (
                  <Rows2 className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {scrollMode === "vertical"
                ? "Switch to single-page mode"
                : "Switch to vertical scroll mode"}
            </TooltipContent>
          </Tooltip>

          {/* Bookmark toggle for current page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative h-11 w-11",
                  isCurrentPageBookmarked && "text-primary"
                )}
                onClick={toggleBookmark}
                disabled={loading || !!error}
                aria-label={
                  isCurrentPageBookmarked ? "Remove bookmark" : "Bookmark page"
                }
              >
                {isCurrentPageBookmarked ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isCurrentPageBookmarked ? "Remove bookmark" : "Bookmark page"}
            </TooltipContent>
          </Tooltip>

          {/* Bookmarks panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11"
                onClick={() => setBookmarksOpen(true)}
                disabled={loading || !!error}
                aria-label="Open bookmarks"
              >
                <BookMarked className="h-5 w-5" />
                {bookmarks.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px] tabular-nums"
                  >
                    {bookmarks.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Bookmarks</TooltipContent>
          </Tooltip>

          {/* Notes panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11"
                onClick={() => setNotesOpen(true)}
                disabled={loading || !!error}
                aria-label="Open notes"
              >
                <StickyNote className="h-5 w-5" />
                {notes.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px] tabular-nums"
                  >
                    {notes.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notes</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Night mode toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-11 w-11", nightMode && "text-primary")}
                onClick={toggleNightMode}
                aria-label="Toggle night mode"
              >
                {nightMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {nightMode ? "Day mode" : "Night mode"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Body / reader area */}
      <div
        className={cn(
          "relative flex-1 overflow-hidden",
          nightMode ? "bg-zinc-950" : "bg-muted"
        )}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">PDF लोड हो रहा है…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="text-base font-semibold">PDF लोड नहीं हो सका</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {error}
              </p>
            </div>
            <Button
              onClick={() => setLoadToken((t) => t + 1)}
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              पुनः प्रयास करें
            </Button>
          </div>
        )}

        {/* Vertical scroll mode: all pages stacked, lazily rendered */}
        {pdf && !loading && !error && scrollMode === "vertical" && (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="relative h-full overflow-y-auto px-2 py-4 sm:px-4"
          >
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:gap-4">
              {Array.from({ length: numPages }, (_, i) => (
                <PdfCanvas
                  key={i + 1}
                  pdf={pdf}
                  pageNumber={i + 1}
                  scale={zoom}
                  nightMode={nightMode}
                  eager={Math.abs(i + 1 - currentPage) <= 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Horizontal single-page mode with slide animation + swipe */}
        {pdf && !loading && !error && scrollMode === "horizontal" && (
          <div className="relative h-full">
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={(d: number) => ({
                    opacity: 0,
                    x: d > 0 ? 60 : -60,
                  })}
                  animate={{ opacity: 1, x: 0 }}
                  exit={(d: number) => ({
                    opacity: 0,
                    x: d > 0 ? -60 : 60,
                  })}
                  transition={{
                    duration: pageTurnAnim ? 0.25 : 0,
                    ease: "easeOut",
                  }}
                  className="flex h-full w-full items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={(_e, info) => {
                    if (info.offset.x < -80) goNext();
                    else if (info.offset.x > 80) goPrev();
                  }}
                >
                  <PdfCanvas
                    pdf={pdf}
                    pageNumber={currentPage}
                    scale={zoom}
                    nightMode={nightMode}
                    eager
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating prev / next arrows */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full shadow-lg sm:left-4"
              onClick={goPrev}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full shadow-lg sm:right-4"
              onClick={goNext}
              disabled={currentPage >= numPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Bottom bar: page indicator + jump input + prev/next */}
      {pdf && !loading && !error && (
        <footer className="z-30 flex items-center justify-center gap-2 border-t bg-background/95 px-3 py-2 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={goPrev}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <PageJumpInput
              value={currentPage}
              max={numPages}
              onJump={goToPage}
            />
            <span className="text-sm tabular-nums text-muted-foreground">
              / {numPages}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={goNext}
            disabled={currentPage >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </footer>
      )}

      {/* Side panels */}
      <BookmarksSheet
        open={bookmarksOpen}
        onOpenChange={setBookmarksOpen}
        bookmarks={bookmarks}
        currentPage={currentPage}
        onJump={(page) => {
          goToPage(page);
          setBookmarksOpen(false);
        }}
        onRemove={(id) => removeBookmark(id)}
      />
      <NotesSheet
        open={notesOpen}
        onOpenChange={setNotesOpen}
        notes={notes}
        currentPage={currentPage}
        onAdd={(text, color) =>
          addNote({ bookId: book.id, page: currentPage, text, color })
        }
        onRemove={(id) => removeNote(id)}
        onJump={(page) => {
          goToPage(page);
          setNotesOpen(false);
        }}
      />
    </div>
  );
}
