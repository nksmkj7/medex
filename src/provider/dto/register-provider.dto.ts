import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDateString,
  IsString,
  IsPhoneNumber,
  IsOptional,
  Validate,
  ValidateIf
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

  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @IsOptional()
  @ValidateIf((object, value) => value)
  @IsPhoneNumber()
  phone2?: string;

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
  @ApiPropertyOptional({
    description: 'Provider Image ',
    type: 'string',
    format: 'binary'
  })
  businessLogo?: string;

  @IsOptional()
  businessDescription?: string;

  @IsOptional()
  vatNo?: string;

  @IsOptional()
  termsCondition?: string;
}
