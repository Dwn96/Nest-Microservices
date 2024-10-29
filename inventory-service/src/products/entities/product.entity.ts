import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column('text')
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', default: 0 })
    stockQuantity: number;

    @Column({ nullable: true })
    imageUrl: string; // Optional field for product image

    @Column({ type: 'boolean', default: true })
    isActive: boolean; // Indicates if the product is available for sale

    @CreateDateColumn()
    createdOn: Date; // Automatically set when a product is created

    @UpdateDateColumn()
    updatedOn: Date; // Automatically set when a product is updated
}
