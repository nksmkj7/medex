import { OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min, Validate } from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { HomeJsonEntity } from '../entity/home-json.entity';
import { HomeJsonDto } from './home-json.dto';

export class UpdateHomeJsonDto extends OmitType(HomeJsonDto, ['position']) {
  @Transform(({ value }) => (Number.isNaN(+value) ? null : +value))
  @IsNotEmpty()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false
    },
    {
      message: 'Position number should be greater or equal to 1'
    }
  )
  @Min(1, {
    message: 'min-{"ln":1,"count":1}'
  })
  @Validate(
    UniqueValidatorPipe,
    [HomeJsonEntity, ['position', 'countryId'], 'id'],
    {
      message: 'already taken'
    }
  )
  position: number;
}
