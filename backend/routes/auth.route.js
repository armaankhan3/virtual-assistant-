import express from 'express';
import { signup, login, logout } from '../controller/auth.controller.js';

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/signin", login);
authRouter.get("/logout", logout);

export default authRouter;