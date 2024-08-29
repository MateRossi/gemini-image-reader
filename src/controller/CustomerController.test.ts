import request from "supertest";
import express from "express";
import { customerValidationRules } from "../validation/CustomerRules";
import { customerController } from "./CustomerController";
import { CustomerService } from "../service/customerService";

const app = express();
app.use(express.json());

app.post('/customers', customerValidationRules, customerController.createCustomer);

jest.mock('../service/CustomerService');

describe('CustomerController', () => {
    it('deve criar um customer e retornar o status code 201', async () => {
        (CustomerService.createCustomer as jest.Mock).mockResolvedValue({
            customer_code: 'b0918a62-f31b-49a9-b16b-296e39a8e66c',
        });

        const response = await request(app)
            .post('/customers')
            .send({ customer_code: 'b0918a62-f31b-49a9-b16b-296e39a8e66c' })

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ customer_code: "b0918a62-f31b-49a9-b16b-296e39a8e66c" });
    });

    it('deve retornar o status code 400 se a validação falhar', async () => {
        const response = await request(app)
            .post('/customers')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error_code', 'INVALID_DATA');
    });

    it('deve retornar o status code 500 se houve um erro ao salvar no banco', async () => {
        (CustomerService.createCustomer as jest.Mock).mockRejectedValue(new Error('Erro ao criar customer'));

        const response = await request(app)
            .post('/customers')
            .send({ customer_code: 'b0918a62-f31b-49a9-b16b-296e39a8e66c' });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error_code', 'DATABASE_ERROR');
        expect(response.body).toHaveProperty('error_description', 'Erro ao criar customer');
    });
});