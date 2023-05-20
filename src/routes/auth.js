import { Router } from "express";
import {
    signUp,
    signIn,
    resetPassword,
    forgotPassword,
} from "../controllers/auth.js";

import { runValidation } from "../validators/index.js";
import {
    userSignupValidator,
    userSigninValidator,
} from "../validators/auth.js";

const authRouter = Router();

//Login
authRouter.post("/login", userSigninValidator, runValidation, signIn);

//Register
authRouter.post("/register", userSignupValidator, runValidation, signUp);

//Forgot Password
authRouter.post("/forgot-password", forgotPassword); //TO TRY

//Reset Password
authRouter.post("/reset-password", resetPassword); //TO TRY

export default authRouter;
