import { IsString } from 'class-validator';

export class UpdateOrderStatusDto {
    @IsString()
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
}
