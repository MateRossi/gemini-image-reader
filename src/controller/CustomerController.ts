import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { customerRepository } from "../repository/CustomerRepository";

export const customerController = {
    async createCustomer(req: Request, res: Response) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ "error_code": "INVALID_DATA", "error_description": errors })
        }

        try {
            const { customer_code } = req.body

            const newCustomer = await customerRepository.insert({ customer_code });

            return res.status(201).json(newCustomer.identifiers[0]);
        } catch (error: any) {
            return res.status(400).json({ "error_code": "DATABASE_ERROR", "error_description": error })
        }
    },
};