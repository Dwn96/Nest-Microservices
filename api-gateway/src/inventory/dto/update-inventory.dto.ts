import { IsNumber, IsPositive } from 'class-validator';

export class UpdateInventoryDto {
    @IsNumber()
    @IsPositive()
    quantity: number;
}
