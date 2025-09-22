import express from 'express';
import { askToAssistant, getcurrentUser, UpdateAssistent } from '../controller/UserController.js';
import isAuth from '../middleware/IsAuth.js';
import upload from '../middleware/Multer.js';
import rateLimit from 'express-rate-limit'

const userRouter = express.Router();

userRouter.get("/current", isAuth, getcurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), UpdateAssistent);
// Backwards-compatible alias for earlier frontend typo/path
userRouter.post("/updateassisment", isAuth, upload.single("assistantImage"), UpdateAssistent);
const assistantLimiter = rateLimit({ windowMs: 60 * 1000, max: 6, standardHeaders: true, legacyHeaders: false, handler: (req, res) => res.status(429).json({ message: 'Too many assistant requests. Try again later.' }) })
userRouter.post("/asktoassistant", isAuth, assistantLimiter, askToAssistant)


export default userRouter;