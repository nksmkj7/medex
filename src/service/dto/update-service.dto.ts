import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateIf
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { ServiceEntity } from '../entity/service.entity';
import { ServiceDto } from './service.dto';

export class UpdateServiceDto extends OmitType(ServiceDto, [
  'title',
  'specialistIds'
]) {
  // @IsNotEmpty()
  // @IsString()
  // @MaxLength(50, {
  //   message: 'maxLength-{"ln":50,"count":50}'
  // })
  // @Validate(
  //   UniqueValidatorPipe,
  //   [
  //     ServiceEntity,
  //     [(value: string) => ({ slug: slugify(value) }), 'userId'],
  //     'id'
  //   ],
  //   {
  //     message: 'has already been assigned to this user'
  //   }
  // )
  // title: string;
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  @Validate(
    UniqueValidatorPipe,
    [ServiceEntity, [(value) => ({ slug: slugify(value) }), 'userId'], 'id'],
    {
      message: 'already taken'
    }
  )
  title: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => !!value)
  @IsJSON()
  removedImages: string;
}
