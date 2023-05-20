import { Router } from "express";
import { register, login } from "../controllers/auth.js";
const authRouter = Router();

//Login
authRouter.post("/login", login);

//Register
authRouter.post("/register", register);

export default authRouter;
