import { AppDataSource } from "../config/data-source";
import { Measure } from "../model/Measure";

export const measureRepository = AppDataSource.getRepository(Measure);