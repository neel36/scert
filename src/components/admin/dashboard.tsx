"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { adminRequest } from "@/lib/api";
import {
  Library,
  GraduationCap,
  BookMarked,
  BookOpen,
  Download,
  Image as ImageIcon,
  PanelLeft,
  Smartphone,
  TrendingUp,
  Layers,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { SectionHeader, EmptyState } from "./_shared";
import type { Book, BookType } from "@/lib/types";
import type { AdminSection } from "./admin-shell";

interface StatsResp {
  stats: {
    mediums: number;
    classes: number;
    subjects: number;
    books: number;
    downloads: number;
    splash: number;
    sidebar: number;
    bottomNav: number;
  };
  topBooks: (Book & {
    subject: {
      name: string;
      class: { name: string; medium: { name: string } };
    };
  })[];
  byType: { type: BookType; _count: number }[];
}

const TYPE_COLORS: Record<BookType, string> = {
  book: "#10b981",
  notes: "#f59e0b",
  other: "#64748b",
};

const TYPE_LABEL: Record<BookType, string> = {
  book: "बुक्स",
  notes: "नोट्स",
  other: "अन्य",
};

export function Dashboard({
  onNavigate,
}: {
  onNavigate: (s: AdminSection) => void;
}) {
  const [data, setData] = React.useState<StatsResp | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    adminRequest<StatsResp>("/api/admin/stats")
      .then((d) => active && setData(d))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const cards = data
    ? [
        {
          label: "माध्यम",
          value: data.stats.mediums,
          icon: Library,
          section: "mediums" as AdminSection,
          color: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "कक्षाएँ",
          value: data.stats.classes,
          icon: GraduationCap,
          section: "classes" as AdminSection,
          color: "bg-amber-50 text-amber-700",
        },
        {
          label: "विषय",
          value: data.stats.subjects,
          icon: BookMarked,
          section: "subjects" as AdminSection,
          color: "bg-rose-50 text-rose-700",
        },
        {
          label: "बुक्स / नोट्स",
          value: data.stats.books,
          icon: BookOpen,
          section: "books" as AdminSection,
          color: "bg-emerald-50 text-emerald-800",
        },
        {
          label: "कुल डाउनलोड",
          value: data.stats.downloads,
          icon: Download,
          section: null,
          color: "bg-violet-50 text-violet-700",
        },
        {
          label: "स्प्लैश स्लाइड्स",
          value: data.stats.splash,
          icon: ImageIcon,
          section: "splash" as AdminSection,
          color: "bg-sky-50 text-sky-700",
        },
        {
          label: "साइडबार आइटम",
          value: data.stats.sidebar,
          icon: PanelLeft,
          section: "sidebar" as AdminSection,
          color: "bg-orange-50 text-orange-700",
        },
        {
          label: "बॉटम नेव",
          value: data.stats.bottomNav,
          icon: Smartphone,
          section: "bottomnav" as AdminSection,
          color: "bg-teal-50 text-teal-700",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="डैशबोर्ड"
        description="आपके ऐप की सामग्री का संक्षिप्त विवरण"
        icon={Layers}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState
          icon={Layers}
          title="डेटा लोड नहीं हो सका"
          description="कृपया पेज रिफ्रेश करें"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => {
              const Icon = c.icon;
              const isLink = c.section !== null;
              return (
                <Card
                  key={c.label}
                  className={
                    isLink
                      ? "cursor-pointer transition-shadow hover:shadow-md"
                      : ""
                  }
                  onClick={() => isLink && c.section && onNavigate(c.section)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${c.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold leading-tight">
                        {c.value.toLocaleString("en-IN")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  टॉप 5 डाउनलोडेड बुक्स
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topBooks.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    कोई डेटा नहीं
                  </p>
                ) : (
                  data.topBooks.map((b, i) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 rounded-md border bg-muted/30 p-2.5"
                    >
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{b.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {b.subject.class.medium.name} › {b.subject.class.name}{" "}
                          › {b.subject.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        <Download className="mr-1 h-3 w-3" />
                        {b.downloads}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  प्रकार अनुसार बुक्स
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.byType.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    कोई डेटा नहीं
                  </p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.byType.map((b) => ({
                          name: TYPE_LABEL[b.type] || b.type,
                          count: b._count,
                          type: b.type,
                        }))}
                        margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RTooltip
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {data.byType.map((b) => (
                            <Cell key={b.type} fill={TYPE_COLORS[b.type]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
