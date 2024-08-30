import request from 'supertest';
import { MeasureService } from '../src/service/measureService';
import { testImage } from './testImage';
import { v4 as uuidv4 } from 'uuid';
import { CustomerService } from '../src/service/customerService';
import testApp from './testApp';
import { measureController } from '../src/controller/MeasureController';
import { measureValidationRules } from '../src/validation/MeasureRules';

jest.mock('../src/service/measureService');
jest.mock('../src/service/customerService');

beforeEach(() => {
    jest.clearAllMocks();
});

testApp.post('/upload', measureValidationRules.uploadRules, measureController.upload);
testApp.patch('/confirm', measureValidationRules.confirmRules, measureController.confirm);
testApp.get('/customers/:customer_code/list', measureValidationRules.getAllMeasuresByCustomerCodeRules, measureController.getAllMeasuresByCustomerCode);

describe('MeasureController: upload', () => {
    it('deve processar uma nova measure e retornar status 200', async () => {
        const customerCode = uuidv4();

        (CustomerService.createCustomer as jest.Mock).mockResolvedValue({
            customer_code: customerCode
        });

        (MeasureService.processNewMeasure as jest.Mock).mockResolvedValue({
            image_url: "https://generativelanguage.googleapis.com/v1beta/files/qky3zyaiirln",
            measure_value: 125,
            measure_uuid: "0469a94d-b39f-452c-8858-db3c76362b1c"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: testImage,
                customer_code: customerCode,
                measure_datetime: "2024-10-27T13:08:00",
                measure_type: "GAS"
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            image_url: expect.stringMatching(/^https:\/\/generativelanguage.googleapis.com\/v1beta\/files\/[a-z0-9]{12}/),
            measure_value: 125,
            measure_uuid: expect.stringMatching(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/)
        }));
    });

    it('deve retornar código 400 para uma imagem inválida', async () => {
        const customerCode = uuidv4();

        (MeasureService.processNewMeasure as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_DATA",
            "error_description": "'image' deve ser uma base64 válida"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: "image",
                customer_code: customerCode,
                measure_datetime: "2024-10-27T13:08:00",
                measure_type: "GAS"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_DATA");
        expect(response.body).toHaveProperty("error_description", "'image' deve ser uma base64 válida");
    });

    it('deve retornar código 400 para um customer_code inválido', async () => {
        (MeasureService.processNewMeasure as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_DATA",
            "error_description": "'image' deve ser uma base64 válida"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: testImage,
                customer_code: "customer_codeInvalido",
                measure_datetime: "2024-10-27T13:08:00",
                measure_type: "GAS"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_DATA");
        expect(response.body).toHaveProperty("error_description", "'customer_code' deve ser um UUID");
    });

    it('deve retornar código 400 para uma data inválida', async () => {
        const customerCode = uuidv4();

        (MeasureService.processNewMeasure as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_DATA",
            "error_description": "A data deve estar no formato (YYYY-MM-DDTHH:MM:SS)"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: testImage,
                customer_code: customerCode,
                measure_datetime: "exemplo da data inválida",
                measure_type: "GAS"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_DATA");
        expect(response.body).toHaveProperty("error_description", "A data deve estar no formato (YYYY-MM-DDTHH:MM:SS)");
    });

    it('deve retornar código 400 para um tipo de measure inválido', async () => {
        const customerCode = uuidv4();

        (MeasureService.processNewMeasure as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_DATA",
            "error_description": "'measure_type' deve ser 'WATER' ou 'GAS'"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: testImage,
                customer_code: customerCode,
                measure_datetime: "2024-10-27T13:08:00",
                measure_type: "GASSTeste"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_DATA");
        expect(response.body).toHaveProperty("error_description", "'measure_type' deve ser 'WATER' ou 'GAS'");
    });

    it('deve retornar código 409 para uma leitura já existente do mesmo tipo no mes', async () => {
        const customerCode = uuidv4();
        const measureDateTime = "2024-10-27T13:08:00";

        (CustomerService.createCustomer as jest.Mock).mockResolvedValue({
            customer_code: customerCode
        });

        (MeasureService.checkExistingMeasure as jest.Mock).mockResolvedValue(true);

        (MeasureService.processNewMeasure as jest.Mock).mockRejectedValue({
            "error_code": "DOUBLE_REPORT",
            "error_description": "Leitura do mês já realizada"
        });

        const response = await request(testApp)
            .post('/upload')
            .send({
                image: testImage,
                customer_code: customerCode,
                measure_datetime: measureDateTime,
                measure_type: "GAS"
            });

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty("error_code", "DOUBLE_REPORT");
        expect(response.body).toHaveProperty("error_description", "Leitura do mês já realizada");
    });
});

describe('MeasureController: confirm', () => {
    it('deve retornar código 200 para uma confirmação de measure válida', async () => {
        const customerCode = uuidv4();

        (MeasureService.getMeasureByUUID as jest.Mock).mockResolvedValue({
            measure_uuid: "0469a94d-b39f-452c-8858-db3c76362b1c",
            image_url: "https://generativelanguage.googleapis.com/v1beta/files/qky3zyaiirln",
            measure_value: 125,
            customer_code: customerCode,
            measure_datetime: "2024-10-27T13:08:00",
            measure_type: "GAS",
            has_confirmed: false
        });

        (MeasureService.confirmMeasure as jest.Mock).mockResolvedValue({
            success: true
        });

        const response = await request(testApp)
            .patch('/confirm')
            .send({
                measure_uuid: "0469a94d-b39f-452c-8858-db3c76362b1c",
                confirmed_value: 125
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
    });

    it('deve retornar código 400 para confirm_value inválido', async () => {
        (MeasureService.confirmMeasure as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_DATA",
            "error_description": "'confirmed_value' deve ser um integer"
        });

        const response = await request(testApp)
            .patch('/confirm')
            .send({
                measure_uuid: "0469a94d-b39f-452c-8858-db3c76362b1c",
                confirmed_value: "número inválido"
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_DATA");
        expect(response.body).toHaveProperty("error_description", "'confirmed_value' deve ser um integer");
    });

    it('deve retornar código 404 para uma tentativa de confirmação de uma measure inexistente', async () => {
        (MeasureService.getMeasureByUUID as jest.Mock).mockResolvedValue(null);

        (MeasureService.confirmMeasure as jest.Mock).mockRejectedValue({
            "error_code": "MEASURE_NOT_FOUND",
            "error_description": "Leitura do mês não encontrada"
        });

        const response = await request(testApp)
            .patch('/confirm')
            .send({
                measure_uuid: "0469a94d-b39f-452c-8858-db3c76362b1c",
                confirmed_value: 125
            });

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error_code", "MEASURE_NOT_FOUND");
        expect(response.body).toHaveProperty("error_description", "Leitura do mês não encontrada");
    });
});

describe('MeasureController: customer_code/list', () => {
    it('deve retornar código 200 para uma listagem bem-sucedida das measures de um customer', async () => {
        const customerCode = uuidv4();
        const measureUuid = uuidv4();

        (CustomerService.findCustomerByCode as jest.Mock).mockResolvedValue({
            customer_code: customerCode
        });

        (MeasureService.getAllMeasuresByCustomerCode as jest.Mock).mockResolvedValue({
            customer_code: customerCode,
            measures: [
                {
                    measure_uuid: measureUuid,
                    measure_datetime: "2024-10-27T13:08:00",
                    measure_type: "GAS",
                    has_confirmed: false,
                    image_url: "https://generativelanguage.googleapis.com/v1beta/files/qky3zyaiirln",
                    measure_value: 125
                }
            ],
        });

        const response = await request(testApp)
            .get(`/customers/${customerCode}/list`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("customer_code", customerCode);
        expect(Array.isArray(response.body.measures)).toBe(true);
    });

    it('deve retornar código 400 para tipo inválido de measure', async () => {
        const customerCode = uuidv4();

        (MeasureService.getAllMeasuresByCustomerCode as jest.Mock).mockRejectedValue({
            "error_code": "INVALID_TYPE",
            "error_description": "'measure_type' deve ser 'WATER' ou 'GAS'"
        });

        const response = await request(testApp)
            .get(`/customers/${customerCode}/list?measure_type=TESTE`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_TYPE");
        expect(response.body).toHaveProperty("error_description", "'measure_type' deve ser 'WATER' ou 'GAS'");

    });

    it('deve retornar código 404 quando nenhuma measure é encontrada para o customer especificado', async () => {
        const customerCode = uuidv4();

        (CustomerService.findCustomerByCode as jest.Mock).mockResolvedValue({
            customer_code: customerCode
        });

        (MeasureService.getAllMeasuresByCustomerCode as jest.Mock).mockRejectedValue({
            "error_code": "MEASURES_NOT_FOUND",
            "error_description": "Nenhuma leitura encontrada"
        });

        const response = await request(testApp)
            .get(`/customers/${customerCode}/list?measure_type=TESTE`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error_code", "INVALID_TYPE");
        expect(response.body).toHaveProperty("error_description", "'measure_type' deve ser 'WATER' ou 'GAS'");
    });
});