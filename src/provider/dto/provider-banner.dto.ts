import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUrl, ValidateIf } from 'class-validator';

export class ProviderBannerDto {
  @ApiProperty({
    description: 'Provider Banner Image',
    type: 'string',
    format: 'binary'
  })
  image: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(({ link }) => {
    if (!link) return false;
    return true;
  })
  @IsUrl()
  link: string;

  @ApiPropertyOptional({
    type: 'boolean',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || !value) {
      return true;
    }
    return false;
  })
  @IsBoolean()
  isFeatured: boolean;

  @ApiPropertyOptional({
    type: 'boolean',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || !value) {
      return true;
    }
    return false;
  })
  @IsBoolean()
  status: boolean;
}
