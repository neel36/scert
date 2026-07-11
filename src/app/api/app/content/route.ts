import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Returns the FULL content tree for the app to render offline-first:
// mediums -> classes -> subjects -> books (only active items).
export async function GET() {
  const mediums = await db.medium.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      classes: {
        where: { active: true },
        orderBy: { order: "asc" },
        include: {
          subjects: {
            where: { active: true },
            orderBy: { order: "asc" },
            include: {
              books: {
                where: { active: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ mediums });
}
