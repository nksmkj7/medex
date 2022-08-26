import { BaseRepository } from 'src/common/repository/base.repository';
import { Between, EntityRepository } from 'typeorm';
import { ScheduleEntity } from './entity/schedule.entity';
import { ScheduleSerializer } from './schedule.serializer';
import * as dayjs from 'dayjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@EntityRepository(ScheduleEntity)
export class ScheduleRepository extends BaseRepository<
  ScheduleEntity,
  ScheduleSerializer
> {
  async serviceSpecialistSchedules(
    serviceId: string,
    specialistId: string,
    date: Date
  ) {
    const schedules = await this.find({
      where: {
        serviceId,
        specialistId,
        date
      }
    });
    return this.transformMany(schedules);
  }

  async getSchedulesForMonth(
    serviceId: string,
    specialistId: string,
    month: number
  ) {
    const currentYear = dayjs().year();
    const startOfMonth = dayjs(`${currentYear}-${month}`, 'YYYY-M').startOf(
      'month'
    );
    const endOfMonth = dayjs(`${currentYear}-${month}`, 'YYYY-M').endOf(
      'month'
    );
    const startDate = dayjs(
      `${currentYear}-${month}-${startOfMonth.date()}`,
      'YYYY-M-D'
    ).format('YYYY-MM-DD');
    const endDate = dayjs(
      `${currentYear}-${month}-${endOfMonth.date()}`,
      'YYYY-M-D'
    ).format('YYYY-MM-DD');
    return this.find({
      where: {
        serviceId,
        specialistId,
        date: Between(startDate, endDate)
      }
    });
  }

  async allServiceSpecialistSchedule(serviceId: string, specialistId: string) {
    const schedules = await this.find({
      where: {
        serviceId,
        specialistId
      }
    });
    return this.transformMany(schedules);
  }

  async dayServiceSpecialistSchedules(
    serviceId: string,
    specialistId: string,
    date: string
  ) {
    return this.find({
      where: {
        serviceId,
        specialistId,
        date
      }
    });
  }
}
