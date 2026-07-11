"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DownloadedBook,
  Bookmark,
  Note,
  ReadingProgress,
  BookWithPath,
} from "@/lib/types";

interface DownloadTask {
  bookId: string;
  title: string;
  progress: number; // 0-100
  status: "downloading" | "done" | "error";
  startedAt: number;
}

interface LibraryState {
  downloads: DownloadedBook[];
  tasks: Record<string, DownloadTask>;
  bookmarks: Bookmark[];
  notes: Note[];
  progress: Record<string, ReadingProgress>;
  readerSettings: {
    zoom: number;
    scrollMode: "vertical" | "horizontal";
    pageTurnAnim: boolean;
    nightMode: boolean;
  };

  isDownloaded: (bookId: string) => boolean;
  startDownload: (book: BookWithPath, onDone?: () => void) => void;
  removeDownload: (bookId: string) => void;
  getTask: (bookId: string) => DownloadTask | undefined;

  addBookmark: (b: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
  getBookmarks: (bookId: string) => Bookmark[];

  addNote: (n: Omit<Note, "id" | "createdAt">) => void;
  removeNote: (id: string) => void;
  getNotes: (bookId: string) => Note[];

  setProgress: (p: ReadingProgress) => void;
  getProgress: (bookId: string) => ReadingProgress | undefined;

  setReaderSettings: (s: Partial<LibraryState["readerSettings"]>) => void;
}

let uid = 0;
function genId(prefix = "id") {
  uid += 1;
  return `${prefix}_${Date.now().toString(36)}_${uid}`;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      downloads: [],
      tasks: {},
      bookmarks: [],
      notes: [],
      progress: {},
      readerSettings: {
        zoom: 1,
        scrollMode: "horizontal",
        pageTurnAnim: true,
        nightMode: false,
      },

      isDownloaded: (bookId) => get().downloads.some((d) => d.id === bookId),

      startDownload: (book, onDone) => {
        const state = get();
        if (state.downloads.some((d) => d.id === book.id)) {
          onDone?.();
          return;
        }
        if (state.tasks[book.id]?.status === "downloading") return;

        const task: DownloadTask = {
          bookId: book.id,
          title: book.title,
          progress: 0,
          status: "downloading",
          startedAt: Date.now(),
        };
        set((s) => ({ tasks: { ...s.tasks, [book.id]: task } }));

        const interval = setInterval(() => {
          const cur = get().tasks[book.id];
          if (!cur || cur.status !== "downloading") {
            clearInterval(interval);
            return;
          }
          const next = Math.min(100, cur.progress + Math.random() * 18 + 6);
          if (next >= 100) {
            clearInterval(interval);
            const entry: DownloadedBook = {
              id: book.id,
              title: book.title,
              type: book.type,
              coverUrl: book.coverUrl,
              pdfUrl: book.pdfUrl,
              fileSize: book.fileSize,
              pages: book.pages,
              icon: book.icon,
              mediumId: book.mediumId,
              mediumName: book.mediumName,
              classId: book.classId,
              className: book.className,
              subjectId: book.subjectId,
              subjectName: book.subjectName,
              downloadedAt: Date.now(),
            };
            set((s) => ({
              tasks: {
                ...s.tasks,
                [book.id]: { ...cur, progress: 100, status: "done" },
              },
              downloads: [...s.downloads.filter((d) => d.id !== book.id), entry],
            }));
            onDone?.();
          } else {
            set((s) => ({
              tasks: {
                ...s.tasks,
                [book.id]: { ...cur, progress: next },
              },
            }));
          }
        }, 450);
      },

      removeDownload: (bookId) =>
        set((s) => ({
          downloads: s.downloads.filter((d) => d.id !== bookId),
          tasks: Object.fromEntries(
            Object.entries(s.tasks).filter(([k]) => k !== bookId)
          ),
          bookmarks: s.bookmarks.filter((b) => b.bookId !== bookId),
          notes: s.notes.filter((n) => n.bookId !== bookId),
          progress: Object.fromEntries(
            Object.entries(s.progress).filter(([k]) => k !== bookId)
          ),
        })),

      getTask: (bookId) => get().tasks[bookId],

      addBookmark: (b) =>
        set((s) => ({
          bookmarks: [
            ...s.bookmarks,
            { ...b, id: genId("bm"), createdAt: Date.now() },
          ],
        })),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((x) => x.id !== id) })),
      getBookmarks: (bookId) =>
        get().bookmarks.filter((b) => b.bookId === bookId),

      addNote: (n) =>
        set((s) => ({
          notes: [...s.notes, { ...n, id: genId("nt"), createdAt: Date.now() }],
        })),
      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((x) => x.id !== id) })),
      getNotes: (bookId) => get().notes.filter((n) => n.bookId === bookId),

      setProgress: (p) =>
        set((s) => ({ progress: { ...s.progress, [p.bookId]: p } })),
      getProgress: (bookId) => get().progress[bookId],

      setReaderSettings: (s) =>
        set((st) => ({ readerSettings: { ...st.readerSettings, ...s } })),
    }),
    {
      name: "cg-board-library",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        downloads: s.downloads,
        bookmarks: s.bookmarks,
        notes: s.notes,
        progress: s.progress,
        readerSettings: s.readerSettings,
      }),
    }
  )
);
