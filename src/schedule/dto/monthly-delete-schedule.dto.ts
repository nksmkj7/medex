import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import * as dayjs from 'dayjs';
import { DeleteScheduleDto } from './delete-schedule.dto';

export class MonthlyDeleteScheduleDto extends DeleteScheduleDto {
  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  month: string;
}
