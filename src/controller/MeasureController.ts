import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { MeasureService } from "../service/measureService";
import { CustomerService } from "../service/customerService";

export const measureController = {
    async upload(req: Request, res: Response) {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    "error_code": "INVALID_DATA",
                    "error_description": errors.array()
                });
            }

            const {
                image,
                customer_code,
                measure_datetime,
                measure_type
            } = req.body;

            //Retorna o customer caso ele já exista ou cria um novo caso não exista.
            const customer = await CustomerService.createCustomer(customer_code);

            const measure = await MeasureService.checkExistingMeasure(customer_code, measure_datetime, measure_type);

            if (measure) {
                return res.status(409).json({ "error_code": "DOUBLE_REPORT", "error_description": "Leitura do mês já realizada" })
            }

            const newMeasure = await MeasureService.processNewMeasure(
                image,
                customer,
                measure_datetime,
                measure_type
            );

            res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid    
            });
        } catch (error: any) {
            console.error("Erro ao processar a medida", error);
            return res.status(500).json({ "error_code": "INTERNAL_SERVER_ERROR", "error_description": "Ocorreu um erro ao processar a medida." });
        }
    }
}