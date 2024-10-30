import { IsPositive, Min } from "class-validator"

export class FetchOrdersDTO {
    @IsPositive()
    @Min(0)
    page: number

    @IsPositive()
    @Min(0)
    limit: number
}