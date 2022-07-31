import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerController } from './banner.controller';
import { BannerRepository } from './banner.repository';
import { BannerService } from './banner.service';

@Module({
  imports: [TypeOrmModule.forFeature([BannerRepository])],
  providers: [BannerService],
  controllers: [BannerController],
  exports: [BannerService]
})
export class BannerModule {}
