import { IsString, IsNumber, IsInt, IsOptional, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateInventoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @IsInt()
    @Min(0)
    stockQuantity: number;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    isActive?: boolean;
}
