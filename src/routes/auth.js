import { Router } from "express";
import { signUp, signIn } from "../controllers/auth.js";

import { runValidation } from "../validators/index.js";
import {
    userSignupValidator,
    userSigninValidator,
} from "../validators/auth.js";
const authRouter = Router();

//Login
authRouter.post("/login", userSigninValidator, signIn);

//Register
authRouter.post("/register", userSignupValidator, runValidation, signUp);

export default authRouter;
