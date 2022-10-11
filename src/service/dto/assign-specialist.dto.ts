import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Validate,
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
  IsUUID,
  IsArray
} from 'class-validator';
import {
  isGreaterThanTime,
  isSmallerThanTime
} from 'src/common/helper/general.helper';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { IsTime } from 'src/common/validators/time-only.decorator';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';

export class AssignSpecialistDto {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(IsValidForeignKey, [SpecialistEntity], { each: true })
  specialistIds: string[];

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
  // @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  status: boolean;
}
