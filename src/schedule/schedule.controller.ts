import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
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

  @Get(':serviceId/:specialistId')
  getServiceSpecialistSchedules(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Param('specialistId', ParseUUIDPipe) specialistId: string
  ) {
    return this.service.serviceSpecialistSchedules(serviceId, specialistId);
  }

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
}
