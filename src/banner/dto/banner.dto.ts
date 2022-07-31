import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { kMaxLength } from 'buffer';
import { Type } from 'class-transformer';
import {
  isBoolean,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  MaxLength,
  Min,
  Validate
} from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { BannerEntity } from '../entity/banner.entity';

export class BannerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'minLength-{"ln":50,"count":50}'
  })
  title: string;

  @Type(() => Number)
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
  @Validate(UniqueValidatorPipe, [BannerEntity, 'position'], {
    message: 'already taken'
  })
  position: number;

  @ApiProperty({
    description: 'Banner Image ',
    type: 'string',
    format: 'binary'
  })
  image: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'minLength-{"ln":2000,"count":2000}'
  })
  seoDescription: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'minLength-{"ln":2000,"count":2000}'
  })
  link: string;

  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;
}
