export class InvalidDataError extends Error {
    constructor(message = 'Os dados fornecidos no corpo da requisição são inválidos') {
        super(message);
        this.name = 'InvalidDataError';
    };
};