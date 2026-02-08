import { IsString, IsOptional, IsInt } from 'class-validator';

export class FilterMessageDto {
  @IsOptional()
  @IsInt()
  userSeqId: number;

  @IsOptional()
  @IsString()
  contentKeyword: string;
}