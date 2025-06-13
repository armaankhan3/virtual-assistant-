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
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
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
