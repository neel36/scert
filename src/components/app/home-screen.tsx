"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Home,
  BookOpen,
  FileText,
  Folder,
  Search,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { BOOK_TYPES } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { BookType, BookWithPath, ContentTree } from "@/lib/types";
import { BookCard } from "./book-card";

interface HomeScreenProps {
  content: ContentTree;
}

const tabMeta: Record<BookType, { label: string; icon: typeof BookOpen }> = {
  book: { label: "बुक्स", icon: BookOpen },
  notes: { label: "नोट्स", icon: FileText },
  other: { label: "अन्य", icon: Folder },
};

export function HomeScreen({ content }: HomeScreenProps) {
  const {
    selectedMediumId,
    selectedClassId,
    selectedTab,
    selectedSubjectId,
    selectMedium,
    selectClass,
    selectTab,
    selectSubject,
  } = useAppStore();
  const [query, setQuery] = useState("");

  const mediums = content.mediums;
  const medium = mediums.find((m) => m.id === selectedMediumId) || null;
  const cls = medium?.classes.find((c) => c.id === selectedClassId) || null;
  const subject = cls?.subjects.find((s) => s.id === selectedSubjectId) || null;

  // Build flat book list (with path) for the currently selected subject + tab
  const books: BookWithPath[] = useMemo(() => {
    if (!subject) return [];
    return subject.books
      .filter((b) => b.type === selectedTab)
      .map((b) => ({
        ...b,
        mediumId: medium!.id,
        mediumName: medium!.name,
        classId: cls!.id,
        className: cls!.name,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectIcon: subject.icon,
        mediumIcon: medium!.icon,
      }));
  }, [subject, selectedTab, medium, cls]);

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [books, query]);

  // --- Level 1: Mediums ---
  if (!medium) {
    return (
      <LevelShell
        title="माध्यम चुनें"
        subtitle="अपना पसंदीदा माध्यम चुनें"
        showBack={false}
      >
        <div className="grid grid-cols-2 gap-3">
          {mediums.map((m, i) => (
            <MediumCard
              key={m.id}
              name={m.name}
              icon={m.icon || "📖"}
              color={m.color || "#059669"}
              count={m.classes.length}
              index={i}
              onClick={() => selectMedium(m.id)}
            />
          ))}
        </div>
      </LevelShell>
    );
  }

  // --- Level 2: Classes ---
  if (!cls) {
    return (
      <LevelShell
        title={medium.name}
        subtitle="कक्षा चुनें"
        showBack
        onBack={() => selectMedium(null)}
        icon={medium.icon || "📖"}
      >
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {medium.classes.map((c, i) => (
            <ClassCard
              key={c.id}
              name={c.name}
              icon={c.icon || "🏫"}
              count={c.subjects.length}
              index={i}
              onClick={() => selectClass(c.id)}
            />
          ))}
        </div>
      </LevelShell>
    );
  }

  // --- Level 3 & 4: Tabs + Subjects ---
  if (!subject) {
    return (
      <LevelShell
        title={cls.name}
        subtitle={`${medium.name} • विषय चुनें`}
        showBack
        onBack={() => selectClass(null)}
        icon={cls.icon || "🏫"}
        tabs={
          <TabsBar
            active={selectedTab}
            onChange={selectTab}
            counts={{
              book: cls.subjects.reduce(
                (n, s) => n + s.books.filter((b) => b.type === "book").length,
                0
              ),
              notes: cls.subjects.reduce(
                (n, s) => n + s.books.filter((b) => b.type === "notes").length,
                0
              ),
              other: cls.subjects.reduce(
                (n, s) => n + s.books.filter((b) => b.type === "other").length,
                0
              ),
            }}
          />
        }
      >
        <div className="grid grid-cols-2 gap-2.5">
          {cls.subjects.map((s, i) => {
            const count = s.books.filter((b) => b.type === selectedTab).length;
            const TabIcon = tabMeta[selectedTab].icon;
            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => selectSubject(s.id)}
                disabled={count === 0}
                className="relative flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm transition-all hover:border-primary/40 hover:shadow-md disabled:opacity-50"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl">
                  {s.icon || "📚"}
                </span>
                <span className="text-sm font-semibold leading-tight">{s.name}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TabIcon className="h-3 w-3" /> {count} आइटम
                </span>
              </motion.button>
            );
          })}
        </div>
      </LevelShell>
    );
  }

  // --- Level 5: Books list ---
  return (
    <LevelShell
      title={subject.name}
      subtitle={`${medium.name} • ${cls.name}`}
      showBack
      onBack={() => selectSubject(null)}
      icon={subject.icon || "📚"}
      tabs={
        <TabsBar
          active={selectedTab}
          onChange={selectTab}
          counts={{
            book: subject.books.filter((b) => b.type === "book").length,
            notes: subject.books.filter((b) => b.type === "notes").length,
            other: subject.books.filter((b) => b.type === "other").length,
          }}
        />
      }
      action={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="किताब खोजें…"
            className="h-9 pl-9"
          />
        </div>
      }
    >
      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={tabMeta[selectedTab].icon}
          title="कोई आइटम नहीं मिला"
          desc={
            query
              ? "खोज से मेल खाती कोई किताब नहीं है।"
              : "इस विषय में अभी कोई आइटम उपलब्ध नहीं है।"
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </LevelShell>
  );
}

// ---------- helpers ----------

function LevelShell({
  title,
  subtitle,
  showBack,
  onBack,
  icon,
  tabs,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  icon?: string;
  tabs?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={onBack}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-card hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Home className="h-4 w-4" />
          </span>
        )}
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight">{title}</h2>
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {tabs}
      {action}
      {children}
    </div>
  );
}

function TabsBar({
  active,
  onChange,
  counts,
}: {
  active: BookType;
  onChange: (t: BookType) => void;
  counts: Record<BookType, number>;
}) {
  return (
    <div className="flex gap-2 rounded-2xl border bg-card p-1.5 shadow-sm">
      {BOOK_TYPES.map((t) => {
        const TabIcon = tabMeta[t.value].icon;
        const isActive = active === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-colors " +
              (isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent")
            }
          >
            <TabIcon className="h-4 w-4" />
            {t.label}
            <span
              className={
                "rounded-full px-1.5 text-[9px] " +
                (isActive ? "bg-white/20" : "bg-muted")
              }
            >
              {counts[t.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MediumCard({
  name,
  icon,
  color,
  count,
  index,
  onClick,
}: {
  name: string;
  icon: string;
  color: string;
  count: number;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl p-5 text-left text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/15 blur-xl" />
      <div className="relative flex flex-col items-start gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-3xl ring-1 ring-white/30">
          {icon}
        </span>
        <div>
          <h3 className="text-lg font-bold leading-tight">{name}</h3>
          <p className="text-xs text-white/85">{count} कक्षाएं उपलब्ध</p>
        </div>
      </div>
    </motion.button>
  );
}

function ClassCard({
  name,
  icon,
  count,
  index,
  onClick,
}: {
  name: string;
  icon: string;
  count: number;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl">
        {icon}
      </span>
      <span className="text-xs font-bold leading-tight">{name}</span>
      <span className="text-[9px] text-muted-foreground">{count} विषय</span>
    </motion.button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof BookOpen;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
