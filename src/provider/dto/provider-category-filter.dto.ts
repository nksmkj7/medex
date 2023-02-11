import { OmitType } from '@nestjs/swagger';
import { CategoryFilterDto } from 'src/category/dto/category-filter.dto';

export class ProviderCategoryFilterDto extends OmitType(CategoryFilterDto, [
  'keywords',
  'mode'
]) {}
