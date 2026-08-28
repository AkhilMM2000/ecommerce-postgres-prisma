import { Router } from "express";
import * as userController from "../controllers/user.controller";

// ─────────────────────────────────────────────────────────────────────────────
// user.routes.ts
//
// This file ONLY defines URL paths and maps them to controller functions.
// No logic. No database. No validation. Just routing.
//
// This router is mounted at "/users" in index.ts, so:
//   "/"    here → "/users"    in the actual app
//   "/:id" here → "/users/:id" in the actual app
// ─────────────────────────────────────────────────────────────────────────────

export const userRouter = Router();

// POST   /users         → create a new user
// GET    /users         → get all users (supports ?orderBy, ?order, ?take, ?skip)
// GET    /users/:id     → get one user by id
// PATCH  /users/:id     → partially update a user
// DELETE /users/:id     → delete a user

userRouter.post("/", userController.createUser);
userRouter.get("/", userController.getAllUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.patch("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
