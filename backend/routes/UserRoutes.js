import express from 'express';
import { askToAssistant, getcurrentUser, UpdateAssistent } from '../controller/UserController.js';
import isAuth from '../middleware/IsAuth.js';
import upload from '../middleware/Multer.js';

const userRouter = express.Router();

userRouter.get("/current", isAuth, getcurrentUser);
userRouter.post("/update", isAuth,upload.single("assistantImage") ,UpdateAssistent);
userRouter.post("/asktoassistant", isAuth, askToAssistant);


export default userRouter;