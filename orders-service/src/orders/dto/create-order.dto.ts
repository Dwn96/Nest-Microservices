import {
    IsArray,
    IsEmail,
    IsObject,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
    IsNumber,
    IsEnum
} from "class-validator";
import { Type } from 'class-transformer';

class OrderItem {
    @IsUUID("all")
    productId: string;

    @Min(1)
    quantity: number;

    @Min(1)
    price: number;
}

class Customer {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    shippingAddress: string;

    @Min(1)
    price: number;
}

enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
}

export class CreateOrderDto {
    @IsObject()
    @ValidateNested()
    @Type(() => Customer)
    customer: Customer;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItem) // Corrected to use OrderItem directly
    items: OrderItem[];

    @IsNumber()
    @Min(1)
    totalAmount: number;

    @IsEnum(OrderStatus)
    status: OrderStatus;
}
