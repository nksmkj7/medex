import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Validate,
  IsBoolean,
  IsInt,
  IsOptional,
  Min
} from 'class-validator';
import {
  isGreaterThanTime,
  isSmallerThanTime
} from 'src/common/helper/general.helper';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { IsTime } from 'src/common/validators/time-only.decorator';

export class AssignServiceDto {
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  additionalTime: number;

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
    default: true
  })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
