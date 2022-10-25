import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageController } from './package.controller';
import { PackageRepository } from './package.repository';
import { PackageService } from './package.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageRepository])],
  providers: [PackageService],
  controllers: [PackageController],
  exports: [PackageService]
})
export class PackageModule {}
