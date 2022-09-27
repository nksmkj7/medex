import { OmitType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { CustomerSignupDto } from './customer-signup.dto';

enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}
export class UpdateProfileDto extends OmitType(CustomerSignupDto, [
  'email',
  'password',
  'confirmPassword'
]) {
  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsNotEmpty()
  postCode: string;

  @IsOptional()
  @IsNotEmpty()
  area: string;

  @IsOptional()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender: GenderEnum;
}
