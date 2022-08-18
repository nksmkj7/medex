import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, ValidateIf } from 'class-validator';

import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

export class ServiceFilterDto extends PartialType(CommonSearchFieldDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  keywords: string;
}
