import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env lives at repo root (../.env); also support server/.env
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "./.env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "12mb" }));

app.get("/", (req, res) => {
    res.json({
        message: "CraftVision backend is running (Gemma 4 via Gemini API)."
    });
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true, model: process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it" });
});

app.use("/api/analyze", analyzeRouter);

app.listen(PORT, () => {
    console.log(`CraftVision server running on http://localhost:${PORT}`);
});