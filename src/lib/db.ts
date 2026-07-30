import { PrismaClient } from "@prisma/client";

// Cache the client across hot-reloads in dev and reuse across serverless
// invocations in production.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please set your Supabase PostgreSQL connection string in DATABASE_URL."
    );
  }

  const log: ("query" | "info" | "warn" | "error")[] =
    process.env.NODE_ENV === "production" ? ["error"] : ["query", "error"];

  return new PrismaClient({ log });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
