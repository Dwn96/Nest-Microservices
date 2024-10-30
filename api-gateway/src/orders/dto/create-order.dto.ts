import { IsString, IsArray, IsNumber, IsEmail, Min, ValidateNested, IsObject, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from './update-order-status.dto';

class OrderItem {
    @IsString()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
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

}

export class CreateOrderDto {
    @IsObject()
    @ValidateNested()
    @Type(() => Customer)
    customer: Customer;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItem)
    items: OrderItem[];

    @IsNumber()
    @Min(1)
    @IsOptional()
    totalAmount: number;

    @IsEnum(OrderStatus)
    @IsOptional()
    status: OrderStatus;
}
