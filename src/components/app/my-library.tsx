"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Library, BookOpen, FileText, Folder, Filter } from "lucide-react";
import { useLibraryStore } from "@/stores/library-store";
import { Button } from "@/components/ui/button";
import { BookCard } from "./book-card";
import type { BookType, BookWithPath, DownloadedBook } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tabMeta: Record<BookType, { label: string; icon: typeof BookOpen }> = {
  book: { label: "बुक्स", icon: BookOpen },
  notes: { label: "नोट्स", icon: FileText },
  other: { label: "अन्य", icon: Folder },
};

export function MyLibrary() {
  const downloads = useLibraryStore((s) => s.downloads);
  const [mediumFilter, setMediumFilter] = useState<string>("all");
  const [tabFilter, setTabFilter] = useState<BookType | "all">("all");

  const mediums = useMemo(() => {
    const map = new Map<string, string>();
    downloads.forEach((d) => map.set(d.mediumId, d.mediumName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [downloads]);

  const filtered = useMemo(() => {
    return downloads.filter((d) => {
      if (mediumFilter !== "all" && d.mediumId !== mediumFilter) return false;
      if (tabFilter !== "all" && d.type !== tabFilter) return false;
      return true;
    });
  }, [downloads, mediumFilter, tabFilter]);

  // group by class -> subject
  const groups = useMemo(() => {
    const byClass = new Map<string, { name: string; items: DownloadedBook[] }>();
    filtered.forEach((d) => {
      const key = `${d.mediumId}|${d.classId}`;
      const existing = byClass.get(key);
      if (existing) existing.items.push(d);
      else
        byClass.set(key, {
          name: `${d.className} • ${d.mediumName}`,
          items: [d],
        });
    });
    return Array.from(byClass.entries()).map(([key, v]) => {
      const bySubject = new Map<string, DownloadedBook[]>();
      v.items.forEach((d) => {
        const arr = bySubject.get(d.subjectName) || [];
        arr.push(d);
        bySubject.set(d.subjectName, arr);
      });
      return { key, className: v.name, subjects: Array.from(bySubject.entries()) };
    });
  }, [filtered]);

  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Library className="h-8 w-8" />
        </span>
        <div>
          <p className="text-sm font-semibold">आपकी लाइब्रेरी खाली है</p>
          <p className="mt-0.5 max-w-[260px] text-xs text-muted-foreground">
            होम स्क्रीन से किताबें, नोट्स या अन्य सामग्री डाउनलोड करें — वे यहाँ
            ऑफलाइन उपलब्ध होंगी।
          </p>
        </div>
      </div>
    );
  }

  const asBookPath = (d: DownloadedBook): BookWithPath => ({
    ...d,
    description: null,
    author: null,
    order: 0,
    active: true,
    subjectId: d.subjectId,
    downloads: 0,
  });

  return (
    <div className="flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Library className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold leading-tight">माई लाइब्रेरी</h2>
          <p className="text-[11px] text-muted-foreground">
            {downloads.length} आइटम डाउनलोडेड • ऑफलाइन उपलब्ध
          </p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
        </div>
        <Select value={mediumFilter} onValueChange={setMediumFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="माध्यम" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">सभी माध्यम</SelectItem>
            {mediums.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {(["all", "book", "notes", "other"] as const).map((t) => {
            const isActive = tabFilter === t;
            const label = t === "all" ? "सभी" : tabMeta[t].label;
            return (
              <button
                key={t}
                onClick={() => setTabFilter(t)}
                className={
                  "rounded-full px-3 py-1 text-[11px] font-medium transition-colors " +
                  (isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* groups */}
      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          इस फ़िल्टर में कोई आइटम नहीं।
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {groups.map((g) => (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border bg-muted/30 p-3"
              >
                <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold">
                  <span className="text-base">🏫</span>
                  {g.className}
                </h3>
                <div className="flex flex-col gap-2">
                  {g.subjects.map(([subjectName, items]) => (
                    <div key={subjectName} className="rounded-xl bg-card p-2">
                      <p className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
                        <span>📚</span> {subjectName}
                        <span className="text-[10px] text-muted-foreground/70">
                          ({items.length})
                        </span>
                      </p>
                      <div className="flex flex-col gap-2">
                        {items.map((d) => (
                          <BookCard key={d.id} book={asBookPath(d)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
