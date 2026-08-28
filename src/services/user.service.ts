import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// user.service.ts
//
// This file is the ONLY place in the application that talks to Prisma directly.
// Controllers call these functions. Controllers never import prisma themselves.
//
// Rule: no req, no res, no HTTP concepts here.
//       Only database logic.
// ─────────────────────────────────────────────────────────────────────────────

// ── CREATE ────────────────────────────────────────────────────────────────────
//
// Prisma:   prisma.user.create({ data: { name, email } })
//
// SQL sent:
//   INSERT INTO "public"."User" ("name", "email")
//   VALUES ($1, $2)
//   RETURNING "id", "name", "email"
//
// Note: RETURNING is added by Prisma automatically.
//       This is why create() gives you back the full object including the id.
//
export const createUser = async (data: { name: string; email: string }) => {
  return prisma.user.create({ data });
};

// ── READ ALL ──────────────────────────────────────────────────────────────────
//
// Prisma:   prisma.user.findMany({ orderBy, take, skip })
//
// SQL sent (example with defaults):
//   SELECT "id", "name", "email"
//   FROM "public"."User"
//   ORDER BY "id" ASC
//   LIMIT 10 OFFSET 0
//
// take  → SQL LIMIT  (how many rows to return)
// skip  → SQL OFFSET (how many rows to skip — used for pagination)
//
export const getAllUsers = async (options: {
  orderBy?: "id" | "name" | "email";
  order?: "asc" | "desc";
  take?: number;
  skip?: number;
}) => {
  const { orderBy = "id", order = "asc", take = 10, skip = 0 } = options;

  return prisma.user.findMany({
    orderBy: { [orderBy]: order },
    take,
    skip,
  });
};

// ── READ ONE ──────────────────────────────────────────────────────────────────
//
// Prisma:   prisma.user.findUnique({ where: { id } })
//
// SQL sent:
//   SELECT "id", "name", "email"
//   FROM "public"."User"
//   WHERE "id" = $1
//   LIMIT 1
//
// Returns: the user object, OR null if not found.
// The controller is responsible for converting null → 404 response.
//
// Why findUnique and not findFirst?
//   findUnique → only works on @id or @unique fields, guaranteed ≤ 1 result
//   findFirst  → works on any field, returns the first match
//   Since id is @id, findUnique is the correct choice here.
//
export const getUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
//
// Prisma:   prisma.user.update({ where: { id }, data })
//
// SQL sent (example — updating only name):
//   UPDATE "public"."User"
//   SET "name" = $1
//   WHERE "id" = $2
//   RETURNING "id", "name", "email"
//
// Important: Prisma's update() throws P2025 if the id does not exist.
// Compare with raw SQL — UPDATE with a non-existent WHERE simply affects 0 rows
// and does NOT throw an error. Prisma is stricter.
//
// Possible errors thrown:
//   P2025 → record not found (id doesn't exist)
//   P2002 → unique constraint (new email already taken by another user)
//
export const updateUser = async (
  id: number,
  data: { name?: string; email?: string }
) => {
  return prisma.user.update({ where: { id }, data });
};

// ── DELETE ────────────────────────────────────────────────────────────────────
//
// Prisma:   prisma.user.delete({ where: { id } })
//
// SQL sent:
//   DELETE FROM "public"."User"
//   WHERE "id" = $1
//   RETURNING "id", "name", "email"
//
// RETURNING means Prisma gives back the deleted user object.
// This is useful so the client knows what was deleted.
//
// Possible errors thrown:
//   P2025 → record not found (id doesn't exist)
//
export const deleteUser = async (id: number) => {
  return prisma.user.delete({ where: { id } });
};
