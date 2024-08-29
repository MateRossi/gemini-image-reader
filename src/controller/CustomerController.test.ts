import request from "supertest";
import { CustomerService } from "../service/customerService";
import { v4 as uuidv4 } from 'uuid';
import testApp from '../utils/testApp';
import { customerValidationRules } from "../validation/CustomerRules";
import { customerController } from "./CustomerController";

jest.mock('../service/CustomerService');

beforeEach(() => {
    jest.clearAllMocks();
});

testApp.post('/customers', customerValidationRules, customerController.createCustomer);

describe('createCustomer', () => {
    it('deve criar um customer e retornar o status code 201', async () => {
        const customerCode = uuidv4();

        (CustomerService.createCustomer as jest.Mock).mockResolvedValue({
            customer_code: customerCode,
        });

        const response = await request(testApp)
            .post('/customers')
            .send({ customer_code: customerCode })

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ customer_code: customerCode });
    });

    it('deve retornar o status code 400 se a validação falhar', async () => {
        const response = await request(testApp)
            .post('/customers')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error_code', 'INVALID_DATA');
    });

    it('deve retornar o status code 500 se houve um erro ao salvar no banco', async () => {
        const customerCode = uuidv4();

        (CustomerService.createCustomer as jest.Mock).mockRejectedValue(new Error('Erro ao criar customer'));

        const response = await request(testApp)
            .post('/customers')
            .send({ customer_code: customerCode });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error_code', 'INTERNAL_SERVER_ERROR');
        expect(response.body).toHaveProperty('error_description', 'Erro ao criar customer');
    });
});