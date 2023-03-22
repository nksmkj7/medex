import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Validate
} from 'class-validator';
import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CityEntity } from '../entities/ city.entity';
import { CountryEntity } from '../entities/country.entity';

export class CityDto extends CommonSearchFieldDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(
    UniqueValidatorPipe,
    [CityEntity, [(value: string) => ({ slug: slugify(value) }), 'countryId']],
    {
      message: 'Name has already been assigned to this user'
    }
  )
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @ApiProperty({
    default: true,
    nullable: true
  })
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
