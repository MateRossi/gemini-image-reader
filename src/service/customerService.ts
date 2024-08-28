import { customerRepository } from "../repository/CustomerRepository"

export class CustomerService {
    static findCustomerByCode = async (customer_code: string) => {
        try {
            const customer = await customerRepository.findOneBy({ customer_code });
            return customer;
        } catch (error) {
            console.error('Erro ao procurar customer', error);
            throw new Error('Erro ao procurar customer');
        };
    };

    //O método save() salva uma entidade no banco. Criando-a caso ela não exista ou a atualizando caso ela exista. Retorna a entidade.
    static createCustomer = async (customer_code: string) => {
        try {
            const customer = customerRepository.create({ customer_code });
            return await customerRepository.save(customer);
        } catch (error) {
            throw new Error('Erro ao criar customer');
        };
    };
}