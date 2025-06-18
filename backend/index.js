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
const PORT = process.env.PORT || 8000;

// ✅ Define allowed origins (NO trailing slashes)
const allowedOrigins = [
  'https://ai-assistant-frontend-brown.vercel.app',
  'http://localhost:5173'
];

// ✅ Setup CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ Manually handle preflight responses and set CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // No Content
  }

  next();
});

// ✅ Logging and parsing middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ✅ API routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/gemini', geminiResponse);

// ✅ Start server
const startServer = async () => {
  try {
    await connectdb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
