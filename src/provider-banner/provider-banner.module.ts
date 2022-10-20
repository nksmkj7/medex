import { Module } from '@nestjs/common';
import { ProviderBannerController } from './provider-banner.controller';
import { ProviderBannerService } from './provider-banner.service';

@Module({
  controllers: [ProviderBannerController],
  providers: [ProviderBannerService]
})
export class ProviderBannerModule {}
