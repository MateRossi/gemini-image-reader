import { Entity, OneToMany, PrimaryColumn, Unique } from "typeorm";
import { Measure } from "./Measure";

@Entity()
@Unique(['customer_code'])
export class Customer {
    @PrimaryColumn('uuid')
    customer_code!: string;

    @OneToMany(() => Measure, (measure) => measure.customer)
    measures!: Measure[]
}