import { IsEmail, IsLowercase, IsNotEmpty } from 'class-validator';

export class CustomerLoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @IsNotEmpty()
  password: string;
}
