import { body } from "express-validator";

export const customerValidationRules = [
    body('customer_code')
        .trim()
        .notEmpty().withMessage("'customer_code' não pode estar vazio")
        .isUUID().withMessage("'customer_code' deve ser um UUID"),
];