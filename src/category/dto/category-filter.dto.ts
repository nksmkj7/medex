import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, Min, ValidateIf } from 'class-validator';

import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

export enum Mode {
  ALL = 'all',
  PARENT = 'parent',
  CHILD = 'child'
}

export class CategoryFilterDto extends PartialType(CommonSearchFieldDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  keywords: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsEnum(Mode)
  mode: Mode;
}

export class SubCategoryFilterDto extends OmitType(CategoryFilterDto, [
  'mode'
]) {}
