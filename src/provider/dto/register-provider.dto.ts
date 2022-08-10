import { OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDate,
  IsInt,
  Allow,
  IsDateString,
  IsString,
  IsEmpty,
  IsPhoneNumber,
  IsOptional,
  Validate
} from 'class-validator';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CountryEntity } from 'src/country/entities/country.entity';

export class RegisterProviderDto extends OmitType(RegisterUserDto, [
  'password'
]) {
  @IsNotEmpty()
  @MinLength(6, {
    message: 'minLength-{"ln":6,"count":6}'
  })
  @MaxLength(20, {
    message: 'maxLength-{"ln":20,"count":20}'
  })
  companyName: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone1: string;

  @IsOptional()
  @IsPhoneNumber()
  phone2: string;

  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsInt()
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  currency?: string;

  @IsOptional()
  contactPerson?: string;

  @IsOptional()
  serviceArea?: string;

  @IsOptional()
  businessLocation?: string;

  @IsOptional()
  businessLogo?: string;

  @IsOptional()
  businessDescription?: string;

  @IsOptional()
  vatNo?: string;

  @IsOptional()
  termsCondition?: string;
}
