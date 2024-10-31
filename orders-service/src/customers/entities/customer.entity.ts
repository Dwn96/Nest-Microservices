import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    shippingAddress: string;

    @OneToMany(() => Order, (order) => order.customer, {cascade: ["insert", "update", "remove"]})
    orders: Order[];
}
