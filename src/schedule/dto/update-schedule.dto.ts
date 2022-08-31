import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min, Validate } from 'class-validator';
import {
  isGreaterThanTime,
  isSmallerThanTime
} from 'src/common/helper/general.helper';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { IsTime } from 'src/common/validators/time-only.decorator';

export class UpdateScheduleDto {
  @IsNotEmpty()
  @IsTime('24h')
  @Validate(RunValidation, [isGreaterThanTime, 'endTime'], {
    message: 'startTime must be greater than endTime'
  })
  startTime: string;

  @IsNotEmpty()
  @IsTime('24h')
  @Validate(RunValidation, [isSmallerThanTime, 'startTime'], {
    message: 'endTime must be greater than startTime'
  })
  endTime: string;

  @ApiProperty({
    description: 'Additional time in minutes'
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0, {
    message: 'min-{"ln":0,"count":0}'
  })
  additionalTime: number;
}
