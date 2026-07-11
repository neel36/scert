import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel: allow up to 60s for large PDFs
export const dynamic = "force-dynamic";

// Server-side PDF proxy: fetches a remote PDF and streams it back with CORS
// headers so pdf.js can render it in the browser without CORS errors.
export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "CG-Board-App/1.0" },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Failed to fetch PDF", { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/pdf";
    const contentLength = upstream.headers.get("content-length") || "";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=86400");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (e) {
    return new NextResponse(
      e instanceof Error ? e.message : "Proxy error",
      { status: 500 }
    );
  }
}
