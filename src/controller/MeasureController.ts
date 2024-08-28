import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { measureRepository } from "../repository/MeasureRepository";
import uploadFile from '../api/FileManager';
import model from "../api/Gemini";
import { customerRepository } from "../repository/CustomerRepository";

export const measureController = {
    async upload(req: Request, res: Response) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ "error_code": "INVALID_DATA", "error_description": errors })
        }

        const {
            image,
            customer_code,
            measure_datetime,
            measure_type
        } = req.body;

        const measure = await measureRepository.createQueryBuilder('measure')
            .innerJoinAndSelect('measure.customer', 'customer')
            .where('customer.customer_code = :customer_code', { customer_code })
            .andWhere('EXTRACT(MONTH FROM measure.measure_datetime) = :month', { month: new Date(measure_datetime).getMonth() +1 })
            .andWhere('EXTRACT(YEAR FROM measure.measure_datetime) = :year', { year: new Date(measure_datetime).getFullYear() })
            .andWhere('measure.measure_type = :measure_type', { measure_type })
            .getOne();

        if (measure) {
            return res.status(409).json({ "error_code": "DOUBLE_REPORT", "error_description": "Leitura do mês já realizada" })
        }

        try {
            const uploadResult = await uploadFile(image, "nome_imagem");
            const prompt = "Given an image of a hydrometer with its scale visible, identify and read the value indicated by the digital display. The value should be extracted from the scale marked on the hydrometer, right before the 'm3'. Return this number as a plain integer.";

            console.log("mime type do arquivo: ", uploadResult.file.mimeType.toString());

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResult.file.mimeType.toString(),
                        fileUri: uploadResult.file.uri
                    }
                },
                { text: prompt },
            ]);

            const customer = await customerRepository.findOneBy({ customer_code });

            if (!customer) {
                return res.status(409).json({ "error_code": "NOT_FOUND", "error_description": "Customer não encontrado" })
            }

            console.log(customer.customer_code);

            const newMeasure = await measureRepository.save({
                measure_datetime,
                measure_type,
                customer,
                image_url: uploadResult.file.uri,
                measure_value: result.response.text()    
            });

            res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid
            });

        } catch (error: any) {
            console.error("Erro ao comunicar com API Gemini", error);
        }
    }
}