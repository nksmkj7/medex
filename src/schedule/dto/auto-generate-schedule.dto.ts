import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, Max, Min } from 'class-validator';
import { ScheduleDto } from './schedule.dto';

export class AutoGenerateScheduleDto extends OmitType(ScheduleDto, [
  'schedules',
  'date'
]) {
  @ApiProperty({
    description: 'number for the month. 0 for january to 11 for december',
    default: 0
  })
  @IsNotEmpty()
  @Min(0, {
    message: 'min-{"ln":0,"count":0}'
  })
  @Max(11, {
    message: 'max-{"ln":11,"count":11}'
  })
  month: number;
}
