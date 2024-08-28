import { AppDataSource } from "../config/data-source";
import { Customer } from "../model/Customer";

export const customerRepository = AppDataSource.getRepository(Customer);