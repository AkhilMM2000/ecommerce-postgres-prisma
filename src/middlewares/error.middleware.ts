import { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// error.middleware.ts — Global Error Handler
//
// In Express, a function with EXACTLY 4 parameters (err, req, res, next)
// is treated as an error-handling middleware.
//
// Flow:
//   Any controller calls next(error)
//         ↓
//   Express skips all normal middleware
//         ↓
//   Comes here
//         ↓
//   We inspect the error and send the right HTTP response
//
// Why centralize this?
//   Without this, every controller would need its own try/catch
//   with duplicate Prisma error detection logic.
//   One middleware handles all routes — including future ones.
// ─────────────────────────────────────────────────────────────────────────────

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction   // must be declared even if unused — Express requires 4 params
) => {
  // ── Prisma Known Errors ─────────────────────────────────────────────────────
  //
  // PrismaClientKnownRequestError covers predictable database errors.
  // Each has a specific code we can map to the correct HTTP status.
  //
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // P2002 — Unique constraint violation
      //
      // Happens when:
      //   INSERT or UPDATE tries to use an email that already exists
      //
      // PostgreSQL error underneath:
      //   ERROR: duplicate key value violates unique constraint "User_email_key"
      //
      // err.meta.target contains the field(s) that caused the conflict
      //
      case "P2002": {
        const field = (err.meta?.target as string[])?.join(", ") ?? "field";
        return res.status(409).json({
          error: `A user with this ${field} already exists`,
        });
        // 409 Conflict = the request conflicts with current state of the resource
      }

      // P2025 — Record not found
      //
      // Happens when:
      //   update() or delete() targets an id that doesn't exist
      //
      // Note: findUnique() does NOT throw P2025 — it just returns null.
      //       Only write operations (update, delete) throw P2025.
      //       That's why getUserById() in the controller checks for null manually.
      //
      case "P2025": {
        return res.status(404).json({
          error: err.meta?.cause ?? "Record not found",
        });
        // 404 Not Found
      }

      // P2003 — Foreign key constraint violation
      //
      // Not relevant yet — we only have one table.
      // This becomes important in Phase 5 when we add relationships.
      // Example: trying to create an Order for a userId that doesn't exist.
      //
      case "P2003": {
        return res.status(400).json({
          error: "Related record not found",
        });
      }
    }
  }

  // ── Prisma Validation Errors ────────────────────────────────────────────────
  //
  // These happen when data doesn't match the Prisma schema constraints
  // before even reaching the database.
  //
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: "Invalid data provided",
    });
  }

  // ── Unknown / Unexpected Errors ─────────────────────────────────────────────
  //
  // Anything we didn't anticipate.
  // Log the full error on the server but don't expose internals to the client.
  //
  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: "Internal server error",
  });
  // 500 = something broke on our side, not the client's fault
};
