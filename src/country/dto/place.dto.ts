import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CityEntity } from '../entities/ city.entity';
import { CountryEntity } from '../entities/country.entity';
import { PlaceEntity } from '../entities/place.entity';

export class PlaceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(
    UniqueValidatorPipe,
    [PlaceEntity, [(value: string) => ({ slug: slugify(value) }), 'cityId']],
    {
      message: 'Name has already been assigned to this user'
    }
  )
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @IsNotEmpty()
  @IsUUID()
  @Validate(IsValidForeignKey, [CityEntity])
  cityId: string;

  @ApiProperty({
    default: true,
    nullable: true
  })
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
