import { check } from "express-validator";

export const userSignupValidator = [
    check("name")
        .isLength({ min: 6 })
        .withMessage("El nombre debe tener al menos 6 caracteres")
        .trim()
        .not()
        .isEmpty()
        .withMessage("El nombre es requerido"),

    check("email")
        .isEmail()
        .withMessage("Debe ingresar un email válido")
        .trim()
        .normalizeEmail()
        .not()
        .isEmpty()
        .withMessage("Debe ingresar un email"),

    check("password")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
];
export const userSigninValidator = [
    check("email")
        .isEmail()
        .trim()
        .normalizeEmail({ gmail_remove_dots: false })
        .withMessage("Debe ingresar un email válido"),

    check("password")
        .trim()
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
];
