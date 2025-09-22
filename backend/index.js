// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectdb from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import UserRouter from "./routes/UserRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import geminiresponse from "./Gemini.js";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Global API rate limiter (protects against spikes)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max requests per IP per minute (tune as needed)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, slow down." },
});
app.use('/api/', apiLimiter);

// Stricter limiter for the assistant endpoint which calls Gemini
const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8, // more strict
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ message: 'Too many assistant requests. Try again later.' })
});

app.use("/api/auth", authRouter);
app.use("/api/user", UserRouter);

app.post("/api/gemini/respond", assistantLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'message' in request body." });
    }

    const reply = await geminiresponse(message, "assistatName", "Danish khan");
    console.log(reply);
    res.json({ reply });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

connectdb();

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});