import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutoGenerateScheduleDto } from './dto/auto-generate-schedule.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('generate-schedule')
  generateSchedules(@Body() createScheduleDto: AutoGenerateScheduleDto) {
    return this.service.generateSchedules(createScheduleDto);
  }
}
