import { IsNotEmpty, IsNumber } from 'class-validator';
import * as dayjs from 'dayjs';
import { DeleteScheduleDto } from './delete-schedule.dto';

export class MonthlyDeleteScheduleDto extends DeleteScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsNumber()
  month: number;
}
