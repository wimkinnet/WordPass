import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import wordsRouter from "./routes/words.js";
import sentencesRouter from "./routes/sentences.js";
import quizRouter from "./routes/quiz.js";
import progressRouter from "./routes/progress.js";
import adminRouter from "./routes/admin.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/words", wordsRouter);
app.use("/api/sentences", sentencesRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/progress", progressRouter);
app.use("/api/admin", adminRouter);

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Set it in .env before deploying.");
}

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
