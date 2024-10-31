import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CheckAvailabilityDto {
    @IsArray()
    @ArrayNotEmpty()
    productIds: number[];

    @IsBoolean()
    @IsOptional()
    flatten?: boolean
}
