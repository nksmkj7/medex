import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min, Validate } from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PackageEntity } from '../entity/package.entity';
import { PackageDto } from './package.dto';

export class UpdatePackageDto extends OmitType(PackageDto, [
  'image',
  'position'
]) {
  @ApiPropertyOptional({
    description: 'Package Image ',
    type: 'string',
    format: 'binary'
  })
  image: string;

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
  @Validate(UniqueValidatorPipe, [PackageEntity, 'position', 'id'], {
    message: 'already taken'
  })
  position: number;
}
