import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, ValidateIf } from 'class-validator';
import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

export class SearchCategoryProvideServiceDto extends CommonSearchFieldDto {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsUUID()
  categoryId: string;
}
