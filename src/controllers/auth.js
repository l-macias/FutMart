//auth controller

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Config from "../config/config.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        //check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        //hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        //create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        //sign token
        const token = jwt.sign(
            { email: newUser.email, id: newUser._id },
            Config.mongoDB.secret,
            { expiresIn: "1h" }
        );

        //send response
        res.status(201).json({ result: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //check if user exists
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User doesn't exist" });

        //check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid credentials" });

        //sign token
        const token = jwt.sign(
            { email: user.email, id: user._id },
            Config.mongoDB.secret,
            { expiresIn: "1d" }
        );

        //send response
        res.status(200).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" }, error);
    }
};
