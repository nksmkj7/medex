import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { RegisterProviderDto } from './register-provider.dto';

export class UpdateProviderDto extends OmitType(RegisterProviderDto, [
  'businessLogo'
] as const) {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Provider Image ',
    type: 'string',
    format: 'binary'
  })
  businessLogo?: string;
}
