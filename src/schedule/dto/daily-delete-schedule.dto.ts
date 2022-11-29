import { IsDate, IsDateString, IsNotEmpty, IsNumber } from 'class-validator';
import * as dayjs from 'dayjs';
import { DeleteScheduleDto } from './delete-schedule.dto';

export class DailyDeleteScheduleDto extends DeleteScheduleDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
