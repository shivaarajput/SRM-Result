import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import resultRoutes from "./routes/result.routes";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    message: "SRM Result API Running"
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/results", resultRoutes);

export default app;