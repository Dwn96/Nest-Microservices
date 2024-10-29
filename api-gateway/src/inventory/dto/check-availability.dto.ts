import { IsArray, IsNumber } from 'class-validator';

export class CheckAvailabilityDto {
    @IsArray()
    productIds: number[];
}
