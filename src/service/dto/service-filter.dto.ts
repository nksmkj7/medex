import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Validate, ValidateIf } from 'class-validator';
import { UserEntity } from 'src/auth/entity/user.entity';

import { CommonSearchFieldDto } from 'src/common/extra/common-search-field.dto';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';

export class ServiceFilterDto extends PartialType(CommonSearchFieldDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  keywords: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => {
    return !!value;
  })
  @Type(() => Number)
  @IsInt()
  @Validate(IsValidForeignKey, [UserEntity])
  provider: number;
}
