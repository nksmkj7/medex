import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { daySchedules, daysOfTheMonth } from 'src/common/helper/date.helper';
import { ServiceRepository } from 'src/service/service.repository';
import { ServiceService } from 'src/service/service.service';
import { SpecialistRepository } from 'src/specialist/specialist.repository';
import { Connection } from 'typeorm';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
import { ScheduleEntity } from './entity/schedule.entity';
import { ScheduleRepository } from './schedule.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly specialistRepository: SpecialistRepository,
    private readonly serviceService: ServiceService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async generateSchedules(generateScheduleDto: AutoGenerateScheduleDto) {
    const { serviceId, specialistId, month } = generateScheduleDto;
    const validServiceSpecialist = await this.checkIfValidServiceSpecialist(
      serviceId,
      specialistId
    );
    if (!validServiceSpecialist) {
      throw new BadRequestException('Invalid service ID or specialist ID');
    }
    const schedulesOfTheMonth = await this.repository.getSchedulesForMonth(
      serviceId,
      specialistId,
      month
    );
    if (schedulesOfTheMonth.length) {
      throw new UnprocessableEntityException(
        'Cannot auto generate schedules cause there are already schedules for this service'
      );
    }
    const { additionalTime, startTime, endTime, durationInMinutes } =
      await this.serviceService.getSpecialistService(serviceId, specialistId);
    // daySchedules(startTime, endTime, additionalTime + durationInMinutes);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const dates = daysOfTheMonth({ month });
    try {
      const manager = queryRunner.manager;
      const schedules = await Promise.all(
        dates.map((date) => {
          const schedule = manager.create(ScheduleEntity, {
            date,
            serviceId,
            specialistId,
            schedules: daySchedules(
              startTime,
              endTime,
              additionalTime + durationInMinutes
            )
          });
          return manager.save(schedule);
        })
      );
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return schedules;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async checkIfValidServiceSpecialist(serviceId: string, specialistId: string) {
    if (!serviceId || !specialistId) {
      return false;
    }
    return this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.specialists', 'specialist')
      .where('specialist.id = :specialistId', { specialistId })
      .getCount();
  }
}
