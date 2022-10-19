import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

export class CategoryProviderServiceDto extends CommonSearchFieldDto {
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subCategoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keywords: string;
}
