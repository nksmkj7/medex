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
    return !!link;
  })
  @IsUrl()
  link: string;

  @ApiPropertyOptional({
    type: 'boolean',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  status: boolean;
}
