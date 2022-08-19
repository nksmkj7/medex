import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialistController } from './specialist.controller';
import { SpecialistRepository } from './specialist.repository';
import { SpecialistService } from './specialist.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialistRepository])],
  providers: [SpecialistService],
  controllers: [SpecialistController],
  exports: [SpecialistService]
})
export class SpecialistModule {}
