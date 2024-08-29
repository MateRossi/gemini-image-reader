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
                    "error_description": errors.array()[0].msg
                });
            };

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

            res.status(200).json(newMeasure);
        } catch (error: any) {
            console.error("Erro ao processar a medida", error);
            return res.status(500).json({ "error_code": "INTERNAL_SERVER_ERROR", "error_description": error.message });
        };
    },

    async confirm(req: Request, res: Response) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    "error_code": "INVALID_DATA",
                    "error_description": errors.array()[0].msg
                });
            };

            const { measure_uuid, confirmed_value } = req.body;

            const measure = await MeasureService.getMeasureByUUID(measure_uuid);

            //Possível erro na mensagem de retorno do erro? Se a medida não foi encontrada, ela não foi realizada ainda.
            //Mudei para "Leitura do mês não encontrada"
            if (!measure) {
                return res.status(404).json({
                    "error_code": "MEASURE_NOT_FOUND",
                    "error_description": "Leitura do mês não encontrada"
                });
            };

            //No PDF está "leitura do mês ja realizada". Mudei para "confirmada".
            if (measure.has_confirmed) {
                return res.status(409).json({
                    "error_code": "CONFIRMATION_DUPLICATE",
                    "error_description": "Leitura do mês já confirmada"
                })
            };

            //Responsável por confirmar ou corrigir o valor lido pelo LLM.
            await MeasureService.confirmMeasure(measure, confirmed_value);

            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error("Erro ao confirmar a medida", error);
            return res.status(500).json({ "error_code": "INTERNAL_SERVER_ERROR", "error_description": "Ocorreu um erro ao confirmar a medida." });
        };
    },

    async getAllMeasuresByCustomerCode(req: Request, res: Response) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    "error_code": "INVALID_TYPE",
                    "error_description": errors.array()[0].msg
                });
            };

            const customer_code = req.params.customer_code.toString();
            const measure_type = req.query.measure_type?.toString();

            const customer = await CustomerService.findCustomerByCode(customer_code);

            if (!customer) {
                return res.status(404).json({
                    "error_code": "CUSTOMER_NOT_FOUND",
                    "error_description": "Cliente não encontrado"
                });
            };

            const measures = await MeasureService.getAllMeasuresByCustomerCode(customer, measure_type);

            if (measures.length === 0) {
                return res.status(404).json({
                    "error_code": "MEASURES_NOT_FOUND",
                    "error_description": "Nenhuma leitura encontrada"
                });
            }

            return res.status(200).json({
                customer_code: customer.customer_code,
                measures
            });
        } catch (error: any) {
            console.error("Erro ao confirmar a medida", error);
            return res.status(500).json({
                "error_code": "INTERNAL_SERVER_ERROR",
                "error_description": "Ocorreu um erro ao listar as medidas do cliente"
            });
        }
    }
};