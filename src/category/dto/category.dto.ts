import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidateIf
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { CategoryEntity } from '../entity/category.entity';

export class CategoryDto {
  @ApiPropertyOptional({
    nullable: true
  })
  @Transform(({ value }) => {
    if (!value) return null;
    return value;
  })
  @ValidateIf((object, value) => !!value)
  @Validate(IsValidForeignKey, [CategoryEntity])
  parentId: string | null;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200, {
    message: 'maxLength-{"ln":200,"count":200}'
  })
  @Validate(
    UniqueValidatorPipe,
    [CategoryEntity, [(value) => ({ slug: slugify(value) }), 'parentId']],
    {
      message: 'already taken'
    }
  )
  title: string;

  @ApiPropertyOptional({
    description: 'Category / Sub-category image',
    type: 'string',
    format: 'binary'
  })
  @IsOptional()
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
  @Validate(UniqueValidatorPipe, [CategoryEntity, ['position', 'parentId']], {
    message: 'already taken'
  })
  position: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(10, {
    message: 'maxLength-{"ln":10,"count":10}'
  })
  color: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'maxLength-{"ln":2000,"count":2000}'
  })
  shortDescription: string;

  @Type(() => Boolean)
  @IsBoolean()
  isNew: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  isFeatured: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;
}
