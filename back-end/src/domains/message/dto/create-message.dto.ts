import { IsString, Length, IsInt } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateMessageDto {
  @Expose({ name: 'userSeqId' })
  @IsInt()
  user_seq_id: number;

  @Expose({ name: 'content' })
  @IsString()
  @Length(0, 255)
  content: string;
}