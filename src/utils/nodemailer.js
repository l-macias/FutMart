import nodemailer from "nodemailer";
import Config from "../config/config.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: Config.nodemailer.email,
        pass: Config.nodemailer.password,
    },
});

export default transporter;
