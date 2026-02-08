import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsInt()
  seqId: number;

  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsBoolean()
  validRecord: boolean;

  @IsOptional()
  @IsBoolean()
  block: boolean;
}