import { IsString, IsArray, IsNumber } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    customerName: string;

    @IsString()
    customerEmail: string;

    @IsArray()
    orderItems: {
        productId: string;
        quantity: number;
        price: number;
    }[];

    @IsNumber()
    totalAmount: number;
}
