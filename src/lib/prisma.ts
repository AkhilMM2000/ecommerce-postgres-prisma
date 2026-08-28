import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// ─── Connection Pool ──────────────────────────────────────────────────────────
//
// Pool opens and manages multiple TCP connections to PostgreSQL.
// Connections are reused across queries — not opened fresh every time.
//
// This reads DATABASE_URL from .env:
//   postgresql://postgres:postgres@localhost:5433/ecommerce_db?schema=public
//
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ─── Adapter ──────────────────────────────────────────────────────────────────
//
// PrismaPg bridges between Prisma's internal query format and the pg library.
// Prisma speaks to this adapter; the adapter speaks to the pool.
//
const adapter = new PrismaPg(pool);

// ─── Prisma Client (Singleton) ────────────────────────────────────────────────
//
// ONE instance shared across the entire application.
// Every service file imports this same `prisma` object.
//
// Why one instance?
//   - Each PrismaClient creates its own connection pool
//   - Multiple instances = multiple pools = too many DB connections
//   - Singleton = one pool, shared safely across all services
//
export const prisma = new PrismaClient({ adapter });
