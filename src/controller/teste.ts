import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { measureValidationRules } from '../validation/MeasureRules';
import { measureController } from './MeasureController';
import { MeasureService } from '../service/measureService';
import { testImage } from '../utils/testImage';
import { v4 as uuidv4 } from 'uuid';
import uploadFile from '../api/FileManager';
import model from '../api/Gemini';
import { measureRepository } from '../repository/MeasureRepository';

const app = express();
app.use(express.json({ limit: '30mb' }));

app.post('/upload', measureValidationRules.uploadRules, measureController.upload);

jest.mock('../service/MeasureService');

describe('MeasureController', () => {
    const mockCustomer = { customer_code: uuidv4() } as any;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('deve processar e salvar uma nova medida com sucesso', async () => {
        const imageBase64 = testImage;
        const uploadResult = { file: { uri: 'http://example.com/image.jpg', mimeType: 'image/jpeg' } };
        const generatedContent = { response: { text: () => 125 } };

        (uploadFile as jest.Mock).mockResolvedValue(uploadResult);
        (model.generateContent as jest.Mock).mockResolvedValue(generatedContent);
        (measureRepository.save as jest.Mock).mockResolvedValue({
            measure_datetime: new Date(),
            measure_type: 'WATER',
            customer: mockCustomer,
            image_url: uploadResult.file.uri,
            measure_value: 125
        });

        const result = await MeasureService.processNewMeasure(
            imageBase64,
            mockCustomer,
            new Date(),
            'WATER'
        );

        expect(uploadFile).toHaveBeenCalledWith(imageBase64);
        expect(model.generateContent).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({
            fileData: expect.objectContaining({
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
            })    
        })]));
        expect(measureRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            measure_datetime: expect.any(Date),
            measure_type: 'WATER',
            customer: mockCustomer,
            image_url: uploadResult.file.uri,
            measure_value: 125
        }));
        expect(result).toEqual(expect.objectContaining({
            measure_datetime: expect.any(Date),
            measure_type: 'WATER',
            customer: mockCustomer,
            image_url: uploadResult.file.uri,
            measure_value: 125
        }));
    });
});