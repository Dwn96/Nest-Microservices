import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CheckAvailabilityDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID("4", { each: true })
    productIds: string[];

    @IsBoolean()
    @IsOptional()
    flatten?: boolean
}
