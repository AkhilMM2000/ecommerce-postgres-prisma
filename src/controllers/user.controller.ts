import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

// ─────────────────────────────────────────────────────────────────────────────
// user.controller.ts
//
// Responsibilities of this file:
//   1. Read data from the HTTP request (req.body, req.params, req.query)
//   2. Validate that data
//   3. Call the appropriate service function
//   4. Send the HTTP response (res.status().json())
//   5. Pass unexpected errors to next() for the error middleware
//
// Rule: no Prisma imports here. No SQL. Only HTTP + service calls.
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /users ───────────────────────────────────────────────────────────────
//
// Request body: { "name": "Akhil", "email": "akhil@example.com" }
// Success:      201 Created  + user object
// Errors:       400 if validation fails
//               409 if email already exists (handled by error middleware)
//
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;

    // Validation — check before hitting the database
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "name is required" });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "valid email is required" });
    }

    const user = await userService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });

    return res.status(201).json(user);
    // 201 Created = resource was successfully created
    // Different from 200 OK — 201 specifically means "something new was made"
  } catch (error) {
    next(error); // pass to error.middleware.ts — handles P2002, P2025, etc.
  }
};

// ── GET /users ────────────────────────────────────────────────────────────────
//
// Optional query params:
//   ?orderBy=name   → sort field  (id | name | email)
//   ?order=desc     → sort direction (asc | desc)
//   ?take=5         → LIMIT (how many rows)
//   ?skip=10        → OFFSET (how many to skip — for pagination)
//
// Example: GET /users?orderBy=name&order=asc&take=5&skip=0
//
// Success: 200 OK + array of users (empty array if none exist)
// Note:    empty result is NOT a 404 — a list being empty is valid
//
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderBy, order, take, skip } = req.query;

    // req.query values are always strings — parse carefully
    const parsedTake = take ? parseInt(take as string) : 10;
    const parsedSkip = skip ? parseInt(skip as string) : 0;

    const validOrderFields = ["id", "name", "email"];
    const validOrderDir = ["asc", "desc"];

    const users = await userService.getAllUsers({
      orderBy: validOrderFields.includes(orderBy as string)
        ? (orderBy as "id" | "name" | "email")
        : "id",
      order: validOrderDir.includes(order as string)
        ? (order as "asc" | "desc")
        : "asc",
      take: isNaN(parsedTake) ? 10 : parsedTake,
      skip: isNaN(parsedSkip) ? 0 : parsedSkip,
    });

    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// ── GET /users/:id ────────────────────────────────────────────────────────────
//
// req.params.id is always a STRING in Express — "1", not 1.
// We must convert it to a number before passing to Prisma.
// If the conversion fails (e.g., /users/abc), return 400.
//
// Success:   200 OK + user object
// Not found: 404 Not Found
// Bad id:    400 Bad Request
//
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "id must be a valid number" });
    }

    const user = await userService.getUserById(id);

    // findUnique returns null when not found — not an error, just no result
    // We convert that null → 404 here in the controller
    if (!user) {
      return res.status(404).json({ error: `User with id ${id} not found` });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// ── PATCH /users/:id ──────────────────────────────────────────────────────────
//
// PATCH = partial update. Only send the fields you want to change.
// PUT   = full replacement. You must send all fields.
// We use PATCH because updating only the name without touching the email
// is a very common real-world need.
//
// Request body: { "name": "New Name" }         ← update only name
//           or: { "email": "new@email.com" }   ← update only email
//           or: { "name": "X", "email": "Y" }  ← update both
//
// Success:   200 OK + updated user object
// Not found: 404 (P2025, handled by error middleware)
// Conflict:  409 (P2002, if new email is already taken)
//
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "id must be a valid number" });
    }

    const { name, email } = req.body;

    // At least one field must be provided — no point calling the DB otherwise
    if (!name && !email) {
      return res.status(400).json({
        error: "provide at least one field to update: name or email",
      });
    }

    // Build the update object with only the provided fields
    const data: { name?: string; email?: string } = {};
    if (name && typeof name === "string") data.name = name.trim();
    if (email && typeof email === "string") data.email = email.trim().toLowerCase();

    const user = await userService.updateUser(id, data);
    return res.status(200).json(user);
  } catch (error) {
    next(error); // P2025 (not found) and P2002 (duplicate email) go here
  }
};

// ── DELETE /users/:id ─────────────────────────────────────────────────────────
//
// Permanently removes the user from the database.
// Returns the deleted user object so the caller knows what was removed.
//
// Success:   200 OK + the deleted user object
// Not found: 404 (P2025, handled by error middleware)
//
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "id must be a valid number" });
    }

    const user = await userService.deleteUser(id);
    return res.status(200).json(user);
  } catch (error) {
    next(error); // P2025 goes here if id not found
  }
};


