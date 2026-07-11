"use client";

import { create } from "zustand";
import type { BookType, BookWithPath } from "@/lib/types";

export type AppScreen =
  | "home"
  | "library"
  | "bookmarks"
  | "downloads"
  | "settings"
  | "exit";

export interface ReaderPayload {
  book: BookWithPath | null;
}

interface AppState {
  // top-level mode
  mode: "app" | "admin";

  // splash + connectivity
  splashDone: boolean;
  online: boolean;

  // navigation
  screen: AppScreen;
  // navigation stack for the "home" browser: medium -> class -> tab -> subject
  selectedMediumId: string | null;
  selectedClassId: string | null;
  selectedTab: BookType; // book | notes | other
  selectedSubjectId: string | null;

  // sidebar
  sidebarOpen: boolean;

  // reader
  readerBook: BookWithPath | null;

  // ad counter (interstitial frequency)
  actionCounter: number;

  // setters
  setMode: (m: "app" | "admin") => void;
  setSplashDone: (v: boolean) => void;
  setOnline: (v: boolean) => void;
  setScreen: (s: AppScreen) => void;
  setSidebarOpen: (v: boolean) => void;
  openReader: (b: BookWithPath) => void;
  closeReader: () => void;

  selectMedium: (id: string | null) => void;
  selectClass: (id: string | null) => void;
  selectTab: (t: BookType) => void;
  selectSubject: (id: string | null) => void;

  bumpAction: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: "app",
  splashDone: false,
  online: true,
  screen: "home",
  selectedMediumId: null,
  selectedClassId: null,
  selectedTab: "book",
  selectedSubjectId: null,
  sidebarOpen: false,
  readerBook: null,
  actionCounter: 0,

  setMode: (m) => set({ mode: m }),
  setSplashDone: (v) => set({ splashDone: v }),
  setOnline: (v) => set({ online: v }),
  setScreen: (s) => {
    set({ screen: s, sidebarOpen: false });
  },
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  openReader: (b) => set({ readerBook: b }),
  closeReader: () => set({ readerBook: null }),

  selectMedium: (id) =>
    set({ selectedMediumId: id, selectedClassId: null, selectedSubjectId: null }),
  selectClass: (id) => set({ selectedClassId: id, selectedSubjectId: null }),
  selectTab: (t) => set({ selectedTab: t }),
  selectSubject: (id) => set({ selectedSubjectId: id }),

  bumpAction: () => {
    const n = get().actionCounter + 1;
    set({ actionCounter: n });
    return n;
  },
}));
