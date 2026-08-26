import express, { Request, Response } from "express";
import { env } from "./config/env";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "E-commerce API is running"
  });
});



app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});