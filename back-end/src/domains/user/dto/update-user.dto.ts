import { IsString, IsEmail, Length, Matches, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserDto {
  @Expose({ name: 'password' })
  @IsOptional()
  @IsString()
  @Length(5, 20, { message: 'Password must be 5 to 20 characters long.' })
  @Matches(/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?/~\-]).*$/, {
    message: 'Password must contain at least one special character.' })
  @Matches(/^(?!.*(.)\1\1).*$/, {
    message: 'Password cannot contain the same character or number more than three times in a row.'})
  password: string;

  @Expose({ name: 'email' })
  @IsOptional()
  @IsEmail()
  @Length(1, 50)
  email: string;

  @Expose({ name: 'name' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  name: string;
}