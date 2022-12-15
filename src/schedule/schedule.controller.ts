import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { scheduled } from 'rxjs';
import { Public } from 'src/common/decorators/public.decorator';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
import { DailyDeleteScheduleDto } from './dto/daily-delete-schedule.dto';
import { MonthlyDeleteScheduleDto } from './dto/monthly-delete-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('generate-schedule')
  generateSchedules(@Body() createScheduleDto: AutoGenerateScheduleDto) {
    return this.service.generateSchedules(createScheduleDto);
  }

  @Public()
  @ApiTags('Public')
  @Get(':serviceId/:specialistId')
  getServiceSpecialistSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string
  ) {
    return this.service.serviceSpecialistSchedules(serviceId, specialistId);
  }

  @Public()
  @ApiTags('Public')
  //get schedule of specific date
  @Get(':serviceId/:specialistId/:date')
  getServiceSpecialistDateSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string,
    @Param('date') date: string
  ) {
    return this.service.serviceSpecialistDateSchedules(
      serviceId,
      specialistId,
      date
    );
  }

  @Put(':serviceId/:specialistId/:date/:scheduleId')
  updateSchedule(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string,
    @Param('date') date: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.service.updateSchedule(
      serviceId,
      specialistId,
      date,
      scheduleId,
      updateScheduleDto
    );
  }

  @Public()
  @ApiTags('Public')
  //get schedule of specific month
  @Get(':serviceId/:specialistId/year/:year/month/:month')
  getServiceSpecialistMonthSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string,
    @Param('month', ParseIntPipe) month: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    return this.service.serviceSpecialistMonthSchedules(
      serviceId,
      specialistId,
      month,
      year
    );
  }

  @Delete('reset-month')
  clearMonthSchedule(@Body() deleteScheduleDto: MonthlyDeleteScheduleDto) {
    return this.service.deleteSchedule(deleteScheduleDto, 'monthly');
  }

  @Delete('reset-day')
  clearDaySchedule(@Body() deleteScheduleDto: DailyDeleteScheduleDto) {
    return this.service.deleteSchedule(deleteScheduleDto, 'daily');
  }

  @Delete(':serviceId/:specialistId/:date/:scheduleId')
  clearSpecificDaySchedule(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string,
    @Param('date') date: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string
  ) {
    return this.service.deleteSpecificDaySchedule(
      serviceId,
      specialistId,
      date,
      scheduleId
    );
  }
  // -----------------------

  @Public()
  @ApiTags('Public')
  @Get(':serviceId')
  getServiceSchedules(@Param('serviceId', ParseUUIDPipe) serviceId: string) {
    return this.service.serviceSpecialistSchedules(serviceId);
  }

  @Public()
  @ApiTags('Public')
  //get schedule of specific date
  @Get('service/:serviceId/date/:date')
  getServiceDateSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('date') date: string
  ) {
    return this.service.serviceSpecialistDateSchedules(serviceId, null, date);
  }

  @Put(':serviceId/:date/:scheduleId')
  updateServiceSchedule(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('date') date: string,
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.service.updateSchedule(
      serviceId,
      null,
      date,
      scheduleId,
      updateScheduleDto
    );
  }

  @Public()
  @ApiTags('Public')
  //get schedule of specific month
  @Get(':serviceId/year/:year/month/:month')
  getServiceMonthSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('month', ParseIntPipe) month: number,
    @Param('year', ParseIntPipe) year: number
  ) {
    return this.service.serviceSpecialistMonthSchedules(
      serviceId,
      null,
      month,
      year
    );
  }
}
