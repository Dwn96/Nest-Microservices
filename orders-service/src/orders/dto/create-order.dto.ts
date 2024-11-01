import {
    IsArray,
    IsEmail,
    IsObject,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
    IsNumber,
    IsEnum,
    IsOptional
} from "class-validator";
import { Type } from 'class-transformer';

class OrderItem {
    @IsUUID("all")
    productId: number;

    @Min(1)
    quantity: number;

    @Min(0)
    @IsOptional()
    price?: number;
}

class Customer {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    shippingAddress: string;
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
    totalAmount?: number;

    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
