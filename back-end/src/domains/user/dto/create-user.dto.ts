import { IsString, IsEmail, Length, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserDto {
  @Expose({ name: 'userId' })
  @IsString()
  @Length(1, 30, { message: 'ID must be 1 to 30 characters.' })
  user_id: string;

  @Expose({ name: 'password' })
  @IsString()
  @Length(5, 20, { message: 'Password must be 5 to 20 characters long.' })
  @Matches(/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?/~\-]).*$/, {
    message: 'Password must contain at least one special character.' })
  @Matches(/^(?!.*(.)\1\1).*$/, {
    message: 'Password cannot contain the same character or number more than three times in a row.'})
  password: string;

  @Expose({ name: 'email' })
  @IsEmail()
  @Length(1, 50)
  email: string;

  @Expose({ name: 'name' })
  @IsString()
  @Length(1, 30)
  name: string;
}