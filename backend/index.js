import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectdb from './config/db.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/UserRoutes.js';
import morgan from 'morgan';
import geminiResponse from './Gemini.js';

const app = express();

const allowedOrigins = [
  'https://ai-assistant-frontend-brown.vercel.app',
  'https://ai-assistant-frontend-armaankhan3s-projects.vercel.app',
  'https://ai-assistant-frontend-git-main-armaankhan3s-projects.vercel.app',
  'http://localhost:5173'
];

// CORS MUST BE FIRST
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

const PORT = process.env.PORT || 8000;
app.use(morgan('dev'));
// Middleware
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/gemini", geminiResponse);


// Start server
const startServer = async () => {
    try {
        await connectdb();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error(' Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();
