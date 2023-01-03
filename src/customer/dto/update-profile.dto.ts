import { OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  isPhoneNumber,
  IsPhoneNumber,
  IsString,
  Validate,
  validate,
  ValidateIf
} from 'class-validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';
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
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ValidateIf((object) => !!object.phoneNumber)
  @IsNotEmpty()
  @IsString()
  dialCode: string;

  @ValidateIf((object, value) => !!value)
  @Validate(RunValidation, [(dialCode: string, value: string) => isPhoneNumber(`${dialCode}${value}`), 'dialCode'], {
    message: 'invalid phone number'
  })
  phoneNumber: string;

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

  @IsOptional()
  @IsString()
  facebook: string;

  @IsOptional()
  @IsString()
  twitter: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsEmpty()
  profilePicture: string;
}
