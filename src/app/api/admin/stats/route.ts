import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardAdmin } from "@/lib/admin-guard";

export async function GET() {
  const g = await guardAdmin();
  if (g) return g;
  const [mediums, classes, subjects, books, downloads, splash, sidebar, bottomNav] =
    await Promise.all([
      db.medium.count(),
      db.class.count(),
      db.subject.count(),
      db.book.count(),
      db.book.aggregate({ _sum: { downloads: true } }),
      db.splashSlide.count(),
      db.sidebarItem.count(),
      db.bottomNavItem.count(),
    ]);

  const topBooks = await db.book.findMany({
    orderBy: { downloads: "desc" },
    take: 5,
    include: { subject: { include: { class: { include: { medium: true } } } } },
  });

  const byType = await db.book.groupBy({
    by: ["type"],
    _count: true,
  });

  return NextResponse.json({
    stats: {
      mediums,
      classes,
      subjects,
      books,
      downloads: downloads._sum.downloads ?? 0,
      splash,
      sidebar,
      bottomNav,
    },
    topBooks,
    byType,
  });
}
