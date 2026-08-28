import express, { Request, Response } from "express";
import { env } from "./config/env";
import { userRouter } from "./routes/user.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json()); // parse incoming JSON request bodies

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "E-commerce API is running" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
//
// userRouter handles all /users routes:
//   POST   /users
//   GET    /users
//   GET    /users/:id
//   PATCH  /users/:id
//   DELETE /users/:id
//
app.use("/users", userRouter);

// Phase 5 will add:
// app.use("/products", productRouter);
// app.use("/orders", orderRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────
//
// IMPORTANT: error middleware must be registered AFTER all routes.
// Express processes middleware in order — if this comes before routes,
// errors from routes will never reach it.
//
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});