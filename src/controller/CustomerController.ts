import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CustomerService } from "../service/customerService";

export const customerController = {
    async createCustomer(req: Request, res: Response) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ "error_code": "INVALID_DATA", "error_description": errors })
            }

            const { customer_code } = req.body

            const newCustomer = await CustomerService.createCustomer(customer_code);

            return res.status(201).json(newCustomer);
        } catch (error: any) {
            return res.status(500).json({ "error_code": "DATABASE_ERROR", "error_description": error.message })
        }
    },
};