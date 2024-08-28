import { DataSource } from "typeorm";
import { Customer } from "../model/Customer";
import { Measure } from "../model/Measure";

const {
    PG_USER, 
    PG_HOST, 
    PG_PASSWORD, 
    PG_DATABASE, 
    PG_PORT
} = process.env;

export const AppDataSource = new DataSource ({
    type: "postgres",
    host: PG_HOST,
    port: Number(PG_PORT),
    username: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE,
    synchronize: true,
    logging: true,
    entities: [Customer, Measure],
    subscribers: [],
    migrations: [],
});