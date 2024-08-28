import uploadFile from "../api/FileManager";
import model from "../api/Gemini";
import { Customer } from "../model/Customer";
import { measureRepository } from "../repository/MeasureRepository";
import { prompt } from "../utils/Prompts";

export class MeasureService {
    static checkExistingMeasure = async (customer_code: string, measure_datetime: Date, measure_type: string) => {
        try {
            const month = measure_datetime.getMonth() + 1;
            const year = measure_datetime.getFullYear();

            return await measureRepository.createQueryBuilder('measure')
                .innerJoinAndSelect('measure.customer', 'customer')
                .where('customer.customer_code = :customer_code', { customer_code })
                .andWhere('EXTRACT(MONTH FROM measure.measure_datetime) = :month', { month })
                .andWhere('EXTRACT(YEAR FROM measure.measure_datetime) = :year', { year })
                .andWhere('measure.measure_type = :measure_type', { measure_type })
                .getOne();
        } catch (error: any) {
            throw error;
        }
    };

    static processNewMeasure = async (imageBase64: string, customer: Customer, measure_datetime: Date, measure_type: string) => {
        try {
            const uploadResult = await uploadFile(imageBase64);

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResult.file.mimeType,
                        fileUri: uploadResult.file.uri
                    }
                },
                { text: prompt },
            ]);

            const newMeasure = await measureRepository.save({
                measure_datetime,
                measure_type,
                customer,
                image_url: uploadResult.file.uri,
                measure_value: parseInt(result.response.text().trim(), 10)
            });

            return newMeasure;
        } catch (error: any) {
            throw new Error("Ocorreu um erro ao processar o pedido")
        }
    }
}