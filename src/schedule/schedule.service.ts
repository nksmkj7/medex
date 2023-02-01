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
import { Between, Connection, DeepPartial, In } from 'typeorm';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
import { ISchedule, ScheduleEntity } from './entity/schedule.entity';
import { ScheduleRepository } from './schedule.repository';
import * as dayjs from 'dayjs';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ProviderService } from 'src/provider/provider.service';
import { weekDays } from 'src/common/constants/weekdays.constants';
import { DailyDeleteScheduleDto } from './dto/daily-delete-schedule.dto';
import { MonthlyDeleteScheduleDto } from './dto/monthly-delete-schedule.dto';
import { BookingEntity } from 'src/booking/entity/booking.entity';
import { memoize } from 'lodash';

type monthlyScheduleResetType = 'monthly';
type dailyScheduleResetType = 'daily';

type R = MonthlyDeleteScheduleDto | DailyDeleteScheduleDto;
import { ScheduleTypeEnum } from 'src/service/enums/schedule-type.enum';
import { IDaySchedules } from 'src/provider/entity/provider-information.entity';
import { isGreaterThanTime } from 'src/common/helper/general.helper';

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
    const {
      additionalTime,
      startTime,
      endTime,
      durationInMinutes,
      scheduleType,
      userId
    } = await this.serviceService.getSpecialistService(serviceId, specialistId);
    if (scheduleType === ScheduleTypeEnum.SERVICE_ONLY && specialistId) {
      throw new BadRequestException(
        'Service subjected to have only service schedule are not allowed to assign specialist schedule.'
      );
    }
    if (!startTime || !endTime) {
      throw new UnprocessableEntityException(
        'Either start time or end time has not been set.'
      );
    }

    const providerDaySchedules = await this.providerService.getDaySchedule(
      userId
    );

    const serviceHolidays = await this.getServiceHolidays(providerDaySchedules);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const dates = daysOfTheMonth({
      year,
      startDate: dayjs(startDate),
      endDate: dayjs(endDate),
      holidays: serviceHolidays.map((holiday) => weekDays.indexOf(holiday)),
      providerDaySchedules
    });
    try {
      const manager = queryRunner.manager;
      const greaterTimeCheckMemoizeFn = memoize(isGreaterThanTime);
      const schedules = await Promise.all(
        dates.map((date) => {
          const scheduleStartTime = greaterTimeCheckMemoizeFn(
            date.startTime,
            startTime
          )
            ? startTime
            : date.startTime;
          const scheduleEndTime = greaterTimeCheckMemoizeFn(
            date.endTime,
            endTime
          )
            ? date.endTime
            : endTime;
          const schedule = manager.create(ScheduleEntity, {
            date: date.date,
            serviceId,
            specialistId,
            schedules: [
              ...daySchedules(
                scheduleStartTime,
                scheduleEndTime,
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
    const additionalTime = 0;
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
    const timeSchedules = schedules[0].schedules;
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
    const prevTimeStatus = prevSchedule
      ? startTimeNumber >= convertTimeToNumber(prevSchedule.endTime)
      : true;
    const nextTimeStatus = nextSchedule
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

  async getServiceHolidays(daySchedules: IDaySchedules) {
    const weekDaysSchedules = Object.keys(daySchedules);
    return weekDays.filter((weekDay) => !weekDaysSchedules.includes(weekDay));
  }

  async deleteSchedule<T>(
    deleteScheduleDto: R,
    type: dailyScheduleResetType | monthlyScheduleResetType
  ): Promise<any> {
    const dateCondition = {};

    if (deleteScheduleDto?.['date'] && type === 'daily') {
      dateCondition['scheduleDate'] = deleteScheduleDto['date'];
    } else if (
      deleteScheduleDto?.['year'] &&
      deleteScheduleDto?.['month'] &&
      type === 'monthly'
    ) {
      const convertedDate = `${deleteScheduleDto['year']}-${String(
        deleteScheduleDto?.['month']
      ).padStart(2, '0')}`;
      dateCondition['scheduleDate'] = Between(
        dayjs(convertedDate, 'YYYY-MM').startOf('month'),
        dayjs(convertedDate, 'YYYY-MM').endOf('month')
      );
    }

    const scheduleIds = await this.connection.manager
      .createQueryBuilder(ScheduleEntity, 'schedule')
      .select('schedule.id')
      .where({
        specialistId: deleteScheduleDto?.['specialistId'] ?? null,
        serviceId: deleteScheduleDto['serviceId'],
        date: dateCondition['scheduleDate']
      })
      .getRawMany();
    if (!scheduleIds.length) {
      throw new UnprocessableEntityException("Schedules don't exist");
    }
    const bookingOnDate = await this.connection
      .createEntityManager()
      .count(BookingEntity, {
        where: {
          ...dateCondition,
          scheduleId: In(scheduleIds.map((schedule) => schedule.schedule_id))
        }
      });

    if (bookingOnDate > 0) {
      throw new UnprocessableEntityException(
        'Booking exits. Cannot delete  schedules.'
      );
    }
    return this.repository.delete({
      specialistId: deleteScheduleDto?.['specialistId'] ?? null,
      serviceId: deleteScheduleDto['serviceId'],
      date: dateCondition['scheduleDate']
    });
  }

  async deleteSpecificDaySchedule(
    serviceId: string,
    specialistId: string,
    date: string,
    scheduleId: string
  ) {
    const schedule = await this.repository.findOneOrFail({
      where: {
        serviceId,
        date,
        specialistId
      }
    });
    const scheduleTime = schedule.schedules.find(
      (scheduleTime) => scheduleTime.id === scheduleId
    );
    if (!scheduleTime) {
      throw new UnprocessableEntityException("Schedule doesn't exist");
    }
    if (scheduleTime.isBooked) {
      throw new UnprocessableEntityException(
        'Booking exits. Cannot delete  schedules.'
      );
    }
    schedule.schedules = schedule.schedules.filter(
      (scheduleTime) => scheduleTime.id !== scheduleId
    );

    return schedule.save();
  }
}
