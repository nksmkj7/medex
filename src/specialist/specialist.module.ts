import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialistController } from './specialist.controller';
import { SpecialRepository } from './specialist.repository';
import { SpecialistService } from './specialist.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialRepository])],
  providers: [SpecialistService],
  controllers: [SpecialistController],
  exports: [SpecialistService]
})
export class SpecialistModule {}
