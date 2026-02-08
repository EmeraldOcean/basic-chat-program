import { Expose, Transform, Type } from "class-transformer";

export class MessageResponseDto {
  @Expose({ name : 'id' })
  @Type(() => Number)
  id: number = -1;

  @Expose({ name : 'user_seq_id' })
  @Transform(({ value }) => value.user?.seq_id)
  userSeqId: number = -1;

  @Expose({ name : 'content' })
  @Type(() => String)
  content: string = '';

  @Expose({ name: 'create_date' })
  @Type(() => Date)
  createDate: Date = new Date();
}