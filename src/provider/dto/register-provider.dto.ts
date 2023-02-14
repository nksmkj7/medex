import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
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
  ValidateIf,
  IsDate,
  IsDecimal,
  IsLatitude,
  IsLongitude
} from 'class-validator';
import dayjs = require('dayjs');
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CountryEntity } from 'src/country/entities/country.entity';

export class RegisterProviderDto extends OmitType(RegisterUserDto, [
  'password'
]) {
  @IsNotEmpty()
  companyName: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone1: string;

  @IsOptional()
  @Transform(({ value }) => dayjs(value).format('YYYY-MM-DD'))
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @IsOptional()
  @ValidateIf((object, value) => {
    return !!value;
  })
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
  currency: string;

  @IsOptional()
  contactPerson?: string;

  @IsOptional()
  serviceArea?: string;

  @IsNotEmpty()
  @IsString()
  businessLocation?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Provider Image ',
    type: 'string',
    format: 'binary'
  })
  businessLogo?: string;

  @IsNotEmpty()
  @IsString()
  businessDescription?: string;

  @IsOptional()
  vatNo?: string;

  @IsOptional()
  termsCondition?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;
}
