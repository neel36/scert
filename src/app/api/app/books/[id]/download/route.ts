import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Increment download counter and return book details (used when a user downloads a book).
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const book = await db.book.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });
  return NextResponse.json({ ok: true, book });
}
