import { OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
  IsNumber,
  Min
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { MenuEntity } from '../entity/menu.entity';
import { MenuDto } from './menu.dto';

export class UpdateMenuDto extends OmitType(MenuDto, ['title', 'position']) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  @Validate(
    UniqueValidatorPipe,
    [MenuEntity, [(value) => ({ slug: slugify(value) }), 'parentId'], 'id'],
    {
      message: 'already taken'
    }
  )
  title: string;

  @Transform((value) => (Number.isNaN(+value) ? null : +value))
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
  @Validate(UniqueValidatorPipe, [MenuEntity, ['position', 'parentId'], 'id'], {
    message: 'already taken'
  })
  position: number;
}
