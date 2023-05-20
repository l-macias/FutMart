import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Routes
app.use("/auth", authRouter);
app.get("/", (req, res) => res.send("Hello World!"));

export default app;
