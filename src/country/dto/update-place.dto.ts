import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PlaceEntity } from '../entities/place.entity';
import { PlaceDto } from './place.dto';

export class UpdatePlaceDto extends OmitType(PlaceDto, ['name']) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(
    UniqueValidatorPipe,
    [
      PlaceEntity,
      [(value: string) => ({ slug: slugify(value) }), 'cityId'],
      'id'
    ],

    {
      message: 'already taken'
    }
  )
  name: string;
}
