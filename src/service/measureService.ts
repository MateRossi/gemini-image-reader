import uploadFile from "../api/FileManager";
import model from "../api/Gemini";
import { Customer } from "../model/Customer";
import { Measure } from "../model/Measure";
import { measureRepository } from "../repository/MeasureRepository";
import { prompt } from "../utils/Prompts";

export class MeasureService {
    static getAllMeasuresByCustomerCode = async (customer: Customer, measure_type?: string) => {
        let whereConditions;
        
        if (measure_type) {
            whereConditions = { customer, measure_type };
        } else {
            whereConditions = { customer };
        };
        
        try {   
            const measures = await measureRepository.find({
                where: whereConditions,
            });
            return measures;
        } catch (error: any) {
            throw new Error('Erro ao buscar medidas do cliente no banco')
        }
    }
    
    static confirmMeasure = async (measure: Measure, confirmed_value: number) => {
        try {
            measure.measure_value = confirmed_value;
            measure.has_confirmed = true;
            await measureRepository.save(measure)
        } catch (error: any) {
            throw new Error('Erro ao confirmar medida no banco');
        };
    };
    
    static getMeasureByUUID = async (measure_uuid: string) => {
        try {
            return await measureRepository.findOneBy({ measure_uuid });
        } catch (error: any) {
            throw new Error("Erro ao buscar medida no banco");
        };
    };
    
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
            throw new Error("Erro ao verificar a existencia de uma medida no mês no banco");
        };
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
        };
    };
}