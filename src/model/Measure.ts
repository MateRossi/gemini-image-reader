import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Customer } from "./Customer";

@Entity()
@Unique(["measure_uuid"])
export class Measure {
    @PrimaryGeneratedColumn('uuid')
    measure_uuid!: string;

    @CreateDateColumn({ type: "timestamp" })
    measure_datetime!: Date;

    @Column({ type: "enum", enum: ["WATER", "GAS"] })
    measure_type!: string;

    @Column({ type: "boolean", default: false })
    has_confirmed!: boolean;

    @Column({ type: "varchar" })
    image_url!: string;

    @Column({ type: "int" })
    measure_value!: number;

    @ManyToOne(() => Customer, (customer) => customer.measures)
    @JoinColumn({ name: 'customer_code' })
    customer!: Customer
}