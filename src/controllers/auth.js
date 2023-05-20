//auth controller

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "lodash";
import Config from "../config/config.js";

export const signUp = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { email: newUser.email, id: newUser._id },
            Config.mongoDB.secret,
            { expiresIn: "1h" }
        );

        res.status(201).json({ result: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { email: user.email, id: user._id },
            Config.mongoDB.secret,
            { expiresIn: "1d" }
        );

        res.status(200).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" }, error);
    }
};

// forgot password

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        User.findOne({ email }, (err, user) => {
            if (err || !user)
                return res.status(401).json({
                    error: "User with this email does not exist",
                });

            const token = jwt.sign({ _id: user._id }, Config.mongoDB.secret, {
                expiresIn: "30m",
            });

            const data = {
                from: "",
                to: email,
                subject: "Password Reset Link",
                html: `
                    <h2>Please click on given link to reset your password</h2>
                    <p>${Config.clientURL}/resetpassword/${token}</p>
                `,
            };
            return user.updateOne({ resetLink: token }, (err, success) => {
                if (err) {
                    return res.status(400).json({
                        error: "Reset password link error",
                    });
                } else {
                    // TODO send email with nodemailer
                    transporter.sendMail(data, (err, info) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong",
                            });
                        } else {
                            return res.status(200).json({
                                message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
                            });
                        }
                    });
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" }, error);
    }
};

// reset password

export const resetPassword = async (req, res) => {
    try {
        const { resetLink, newPass } = req.body;
        if (resetLink) {
            jwt.verify(
                resetLink,
                Config.mongoDB.secret,
                function (error, decoded) {
                    if (error) {
                        return res.status(401).json({
                            error: "Incorrect token or it is expired",
                        });
                    }
                    User.findOne({ resetLink }, (err, user) => {
                        if (err || !user) {
                            return res.status(400).json({
                                error: "User with this token does not exist",
                            });
                        }
                        const obj = {
                            password: newPass,
                            resetLink: "",
                        };
                        user = _.extend(user, obj);
                        user.save((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Reset password error",
                                });
                            } else {
                                return res.status(200).json({
                                    message: "Your password has been changed",
                                });
                            }
                        });
                    });
                }
            );
        } else {
            return res.status(401).json({ error: "Authentication error" });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" }, error);
    }
};
