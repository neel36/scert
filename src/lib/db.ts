import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Cache the client across hot-reloads in dev and reuse across serverless
// invocations in production.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. For local dev use a file: URL, for Vercel use a Turso libSQL URL (libsql://...)."
    );
  }

  const log = process.env.NODE_ENV === "production" ? ["error"] : ["query", "error"];

  // Local SQLite file (dev) — no adapter needed, use the default Prisma engine.
  if (url.startsWith("file:")) {
    return new PrismaClient({ log });
  }

  // Turso / libSQL (Vercel production) — use the libSQL driver adapter.
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!authToken) {
    throw new Error(
      "DATABASE_AUTH_TOKEN is not set. Set this env var when DATABASE_URL starts with libsql://, e.g. in Vercel Settings or .env.local."
    );
  }

  console.log("createPrismaClient called. URL:", url, "AuthToken length:", authToken.length);

  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter, log });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
