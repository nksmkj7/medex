import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsUUID,
  Validate,
  ValidateNested
} from 'class-validator';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { IsTime } from 'src/common/validators/time-only.decorator';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';

class TimeDto {
  @IsNotEmpty()
  @IsUUID(4)
  uuid: string;

  @IsNotEmpty()
  @IsTime('24h')
  startTime: string;

  @IsNotEmpty()
  @IsTime('24h')
  endTime: string;

  @Optional()
  @IsTime('24h')
  isBooked: boolean;
}

export class ScheduleDto {
  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [ServiceEntity])
  serviceId: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [SpecialistEntity])
  specialistId: string;

  @IsNotEmpty()
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TimeDto)
  schedules: TimeDto[];
}
