import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from 'src/service/service.repository';
import { SpecialistRepository } from 'src/specialist/specialist.repository';
import { ScheduleRepository } from './schedule.repository';
import { ServiceModule } from 'src/service/service.module';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  providers: [ScheduleService],
  controllers: [ScheduleController],
  imports: [
    TypeOrmModule.forFeature([
      ServiceRepository,
      SpecialistRepository,
      ScheduleRepository
    ]),
    ServiceModule,
    ProviderModule
  ]
})
export class ScheduleModule {}
