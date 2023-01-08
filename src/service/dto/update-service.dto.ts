import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
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
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  @Validate(
    UniqueValidatorPipe,
    [ServiceEntity, [(value) => ({ slug: slugify(value) }), 'userId'], 'id'],
    {
      message: 'already taken'
    }
  )
  title: string;
}
