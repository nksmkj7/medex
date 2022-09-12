import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidateIf
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { MenuEntity } from '../entity/menu.entity';

export enum MenuType {
  DIRECT = 'direct',
  DROPDOWN = 'dropdown'
}

export class MenuDto {
  @ApiPropertyOptional({
    nullable: true
  })
  @Transform(({ value }) => {
    if (!value) return null;
    return value;
  })
  @ValidateIf((object, value) => !!value)
  parentId: number | null;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  @Validate(
    UniqueValidatorPipe,
    [MenuEntity, [(value) => ({ slug: slugify(value) }), 'parentId']],
    {
      message: 'already taken'
    }
  )
  title: string;

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
  @Validate(UniqueValidatorPipe, [MenuEntity, ['position', 'parentId']], {
    message: 'already taken'
  })
  position: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'maxLength-{"ln":2000,"count":2000}'
  })
  link: string;

  @Type(() => Boolean)
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    enum: MenuType,
    enumName: 'Menu Type',
    default: MenuType.DIRECT
  })
  @IsEnum(MenuType, {
    message: 'isEnum-{"items":"direct,dropdown"}'
  })
  menuType: MenuType;
}
