import { OmitType } from '@nestjs/swagger';
import { ProviderBannerDto } from './provider-banner.dto';

export class UpdateProviderBannerDto extends OmitType(ProviderBannerDto, [
  'image'
]) {}
