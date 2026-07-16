import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient, type Client } from "@libsql/client";

// Cache the client across hot-reloads in dev and reuse across serverless
// invocations in production.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  libsqlClient: Client | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. For local dev use a file: URL, for Vercel use a Turso libSQL URL (libsql://...)."
    );
  }

  // Local SQLite file (dev) — no adapter needed, use the default Prisma engine.
  if (url.startsWith("file:")) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error"],
    });
  }

  // Turso / libSQL (Vercel production) — use the libSQL driver adapter.
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  console.log("createPrismaClient called. URL:", url, "AuthToken length:", authToken?.length);
  const libsqlClient = createClient({
    url,
    authToken: authToken || undefined,
  });
  const adapter = new PrismaLibSql(libsqlClient);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
