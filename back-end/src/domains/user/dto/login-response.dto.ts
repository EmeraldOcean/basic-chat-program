import { Transform } from 'class-transformer';

export class LoginResponseDto {
  @Transform(({ value }) => value ? value : null)
  userSeqId: number = -1;

  @Transform(({ value }) => value ? value : null)
  accessToken: string = "";

  @Transform(({ value }) => value ? value : null)
  refreshToken: string = "";
}