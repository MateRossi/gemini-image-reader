import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./Customer";

@Entity()
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

    @ManyToOne(() => Customer, (customer) => customer.measures)
    @JoinColumn({ name: 'customer_code' })
    customer!: Customer
}