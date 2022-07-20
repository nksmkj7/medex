import { ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';
import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';

const searchScopeEnum = [
  'name',
  'alphaCode',
  'alphaCode3',
  'alternateSpellings',
  'callingCodes',
  'currencies',
  'languages',
  'flag'
];
export class CountryDto extends CommonSearchFieldDto {
  @ApiPropertyOptional({
    name: 'searchScopes',
    enum: searchScopeEnum,
    isArray: true
  })
  searchScopes: string[];
}
