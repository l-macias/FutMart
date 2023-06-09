//auth controller

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import _ from "lodash";
import Config from "../config/config.js";
import transporter from "../utils/nodemailer.js";

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
//TODO ARMAR BIEN EL MAIL Y CREAR EL CLIENTE URL
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: "No existe usuario con ese email",
            });
        }
        const token = jwt.sign({ _id: user._id }, Config.mongoDB.secret, {
            expiresIn: "30m",
        });

        const resetLink = `${Config.global.port}/auth/password/reset?token=${token}`;

        const msg = {
            from: Config.nodemailer.email,
            to: email,
            subject: `Restablecer su Contraseña - ${Config.global.port}`,
            html: `
                <p>Use el siguiente link para restablecer su contraseña:</p>
                <p>${resetLink}</p>

                <hr/>
                <p>Este correo puede contener información importante y privada</p>
                <p>https://nombredemipagina.com</p>
            `,
        };

        await user.updateOne({ resetPasswordLink: token });
        await transporter.sendMail(msg);

        return res.json({
            message: `El Correo ha sido enviado a ${email}. Siga las instrucciones para restablecer su contraseña. El link expira en 30 minutos`,
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Algo salió mal" });
    }
};

export const resetPassword = (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                error: "El link de restablecimiento de contraseña es requerido",
            });
        }

        jwt.verify(token, Config.mongoDB.secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: "El link ha expirado o es inválido, intente de nuevo",
                });
            }

            User.findOne({ resetPasswordLink: token }, (err, user) => {
                if (err || !user) {
                    return res
                        .status(401)
                        .json({ error: "Algo ha salido mal" });
                }

                user.password = newPassword;
                user.resetPasswordLink = "";

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "No se pudo actualizar la contraseña",
                        });
                    }

                    res.json({
                        message:
                            "¡Genial! Ahora puedes iniciar sesión con tu nueva contraseña",
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Algo salió mal" });
    }
};
