import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FilterRefreshTokenDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userSeqId: number;

  @IsOptional()
  @Type(() => String)
  @IsString()
  refreshToken: string;
}