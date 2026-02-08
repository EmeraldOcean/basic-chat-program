import { Expose, Type } from "class-transformer";

export class UserResponseDto {
  @Expose({ name : 'seq_id' })
  @Type(() => Number)
  seqId: number;

  @Expose({ name : 'user_id' })
  @Type(() => String)
  userId: string;

  @Expose({ name : 'email' })
  @Type(() => String)
  email: string;

  @Expose({ name : 'name' })
  @Type(() => String)
  name: string;

  @Expose({ name: 'create_date' })
  @Type(() => Date)
  createDate: Date;
}