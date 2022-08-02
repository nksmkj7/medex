import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, Min, ValidateIf } from 'class-validator';

import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

export enum MenuType {
  DIRECT = 'direct',
  DROPDOWN = 'dropdown'
}

export enum Mode {
  ALL = 'all',
  PARENT = 'parent',
  CHILD = 'child'
}

export class MenuFilterDto extends PartialType(CommonSearchFieldDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  keywords: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsEnum(MenuType)
  menuType: MenuType;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsEnum(Mode)
  mode: Mode;
}
