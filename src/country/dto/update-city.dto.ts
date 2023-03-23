import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { CityEntity } from '../entities/ city.entity';
import { CityDto } from './city.dto';

export class UpdateCityDto extends OmitType(CityDto, ['name']) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(
    UniqueValidatorPipe,
    [
      CityEntity,
      [(value: string) => ({ slug: slugify(value) }), 'countryId'],
      'id'
    ],

    {
      message: 'already taken'
    }
  )
  name: string;
}
