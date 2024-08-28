import { body } from "express-validator";

export const measureValidationRules = [
    body('image')
        .trim()
        .notEmpty().withMessage('"image não pode estar vazio"')
        .isString().withMessage('"image" deve ser uma string')
        .isBase64().withMessage('"image" deve ser uma base64 válida'),
        
    body('customer_code')
        .trim()
        .notEmpty().withMessage('"customer_code" não pode estar vazio')
        .isUUID().withMessage('"customer_code deve ser um UUID"'),

    body('measure_datetime')
    .trim()
    .notEmpty().withMessage('"measure_datetime não pode estar vazio"')
    .isISO8601().withMessage('A data deve estar no formato (YYYY-MM-DDTHH:MM:SS)')
    .toDate(),    

    body('measure_type')
        .trim()
        .notEmpty().withMessage('"measure_type" não pode estar vazio')
        .toUpperCase()
        .isString().withMessage('"measure_type" deve ser uma string')
        .isIn(["WATER", "GAS"]).withMessage('"measure_type" deve ser "WATER" ou "GAS"')
];