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

app.use("/api/auth", authRouter);
app.use("/api/user", UserRouter);

app.post("/api/gemini/respond", async (req, res) => {
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