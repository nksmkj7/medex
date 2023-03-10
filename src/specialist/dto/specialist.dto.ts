import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidateIf
} from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CountryEntity } from 'src/country/entities/country.entity';
import { SpecialistEntity } from '../entity/specialist.entity';

export class SpecialistDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  fullName: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsOptional()
  @IsPhoneNumber()
  contactNo: string;

  @ApiPropertyOptional({
    description: 'Specialist Profile Image ',
    type: 'string',
    format: 'binary'
  })
  image: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primarySpecialty: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  educationTraining: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceExpertise: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publicAwards: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  membershipActivities: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  // @Validate(
  //   UniqueValidatorPipe,
  //   [SpecialistEntity, ['licenseRegistrationNumber', 'licenseCountry']],
  //   {
  //     message: 'already taken'
  //   }
  // )
  licenseRegistrationNumber: string;

  @ApiPropertyOptional({
    type: 'number'
  })
  @IsOptional()
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsInt()
  @Validate(IsValidForeignKey, [CountryEntity])
  licenseCountry: number;

  @ApiProperty({
    default: true
  })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  status: boolean;
}
