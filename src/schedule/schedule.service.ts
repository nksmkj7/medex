import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  daySchedules,
  daysOfTheMonth,
  getTimeFn
} from 'src/common/helper/date.helper';
import { ServiceRepository } from 'src/service/service.repository';
import { ServiceService } from 'src/service/service.service';
import { SpecialistRepository } from 'src/specialist/specialist.repository';
import { Connection, DeepPartial } from 'typeorm';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
import { ISchedule, ScheduleEntity } from './entity/schedule.entity';
import { ScheduleRepository } from './schedule.repository';
import * as dayjs from 'dayjs';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ProviderService } from 'src/provider/provider.service';
import { weekDays } from 'src/common/constants/weekdays.constants';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly specialistRepository: SpecialistRepository,
    private readonly serviceService: ServiceService,
    private readonly providerService: ProviderService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async generateSchedules(generateScheduleDto: AutoGenerateScheduleDto) {
    const {
      serviceId,
      specialistId = null,
      startDate,
      endDate
    } = generateScheduleDto;
    const validServiceSpecialist = await this.checkIfValidServiceSpecialist(
      serviceId,
      specialistId
    );
    if (!validServiceSpecialist) {
      throw new BadRequestException('Invalid service ID or specialist ID');
    }

    //month is always one less than expected. 0 for jan and 11 for dec
    const month = dayjs(startDate).month() + 1;

    const year = dayjs(startDate).year();

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

    const serviceHolidays = await this.getServiceHolidays(serviceId);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const dates = daysOfTheMonth({
      year,
      startDate: dayjs(startDate),
      endDate: dayjs(endDate),
      holidays: serviceHolidays.map((holiday) => weekDays.indexOf(holiday))
    });
    try {
      const manager = queryRunner.manager;
      const schedules = await Promise.all(
        dates.map((date) => {
          const schedule = manager.create(ScheduleEntity, {
            date,
            serviceId,
            specialistId,
            schedules: [
              ...daySchedules(
                startTime,
                endTime,
                additionalTime + durationInMinutes
              )
            ]
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

  async checkIfValidServiceSpecialist(
    serviceId: string,
    specialistId: string | null
  ) {
    if (!serviceId) {
      return false;
    }

    const query = this.serviceRepository
      .createQueryBuilder('service')
      .where(`service.id = :serviceId`, { serviceId });
    if (specialistId) {
      query
        .leftJoin('service.specialists', 'specialist')
        .where('specialist.id = :specialistId', { specialistId });
    }
    return query.getCount();
  }

  serviceSpecialistSchedules(
    serviceId: string,
    specialistId: string | null = null
  ) {
    return this.repository.allServiceSpecialistSchedule(
      serviceId,
      specialistId
    );
  }

  async serviceSpecialistDateSchedules(
    serviceId: string,
    specialistId: string,
    date: string
  ) {
    if (!dayjs(date, 'YYYY-MM-DD').isValid()) {
      throw new BadRequestException(
        'Invalid date. Date should be in `YYYY-MM-DD` format.'
      );
    }
    const schedules = await this.repository.dayServiceSpecialistSchedules(
      serviceId,
      specialistId,
      date
    );
    if (!schedules.length) {
      throw new NotFoundException('Schedules not found.');
    }
    return this.repository.transform(schedules[0]);
  }

  async updateSchedule(
    serviceId: string,
    specialistId: string,
    date: string,
    scheduleId: string,
    updateScheduleDto: DeepPartial<UpdateScheduleDto>
  ) {
    let { startTime, endTime } = updateScheduleDto;
    let additionalTime = 0;
    endTime = getTimeFn(endTime, additionalTime);
    if (!dayjs(date, 'YYYY-MM-DD').isValid()) {
      throw new BadRequestException(
        'Invalid date. Date should be in `YYYY-MM-DD` format.'
      );
    }
    const schedules = await this.repository.dayServiceSpecialistSchedules(
      serviceId,
      specialistId,
      date
    );
    if (!schedules.length) {
      throw new NotFoundException('Schedules not found.');
    }
    const currentTimeScheduleIndex = schedules[0]['schedules'].findIndex(
      (schedule: ISchedule) => schedule.id === scheduleId
    );

    if (
      !this.checkScheduleOverlap(
        startTime,
        endTime,
        schedules[0].schedules,
        currentTimeScheduleIndex
      )
    ) {
      throw new UnprocessableEntityException(
        'Either start time or end time have been overlapped with other schedule'
      );
    }
    let timeSchedules = schedules[0].schedules;
    timeSchedules[currentTimeScheduleIndex] = {
      ...timeSchedules[currentTimeScheduleIndex],
      startTime,
      endTime
    };
    await this.repository.update(
      {
        serviceId,
        specialistId,
        date
      },
      { schedules: timeSchedules }
    );
    return this.repository.transform(schedules[0]);
  }

  checkScheduleOverlap(
    startTime: string,
    endTime: string,
    schedules: ISchedule[],
    scheduleIndex: number
  ) {
    const convertTimeToNumber = (time: string) => Number(time.replace(':', ''));
    const startTimeNumber = convertTimeToNumber(startTime);
    const endTimeNumber = convertTimeToNumber(endTime);
    const prevSchedule = schedules[scheduleIndex - 1] ?? null;
    const nextSchedule = schedules[scheduleIndex + 1] ?? null;
    let prevTimeStatus = prevSchedule
      ? startTimeNumber >= convertTimeToNumber(prevSchedule.endTime)
      : true;
    let nextTimeStatus = nextSchedule
      ? endTimeNumber <= convertTimeToNumber(nextSchedule.startTime)
      : true;
    return prevTimeStatus && nextTimeStatus;
  }

  async serviceSpecialistMonthSchedules(
    serviceId: string,
    specialistId: string,
    month: number,
    year?: number
  ) {
    return this.repository.getSchedulesForMonth(
      serviceId,
      specialistId,
      month,
      year
    );
  }

  async getServiceHolidays(serviceId: string) {
    const service = await this.serviceRepository.findOneOrFail(serviceId);
    return this.providerService.providerWeekHolidays(service.userId);
  }
}
