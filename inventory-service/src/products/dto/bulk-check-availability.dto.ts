import { IsArray, IsBoolean, IsOptional } from "class-validator";

export class BulkCheckProductAvailabilities {

    @IsArray()
    productIds: Number[];

    @IsOptional()
    @IsBoolean()
    flatten?: boolean
}