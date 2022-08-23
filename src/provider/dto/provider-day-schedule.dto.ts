import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { IsTime } from 'src/common/validators/time-only.decorator';

class ScheduleDto {
  @ValidateIf((object) => {
    return !!object.endTime;
  })
  @IsNotEmpty()
  @IsTime('24h')
  startTime: string;

  @ValidateIf((object) => {
    return !!object.startTime;
  })
  @IsNotEmpty()
  @IsTime('24h')
  endTime: string;
}

class DayDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  sunday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  monday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  tuesday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  wednesday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  thursday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  friday: ScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  saturday: ScheduleDto;
}

export class ProviderDayScheduleDto {
  @ApiProperty({
    nullable: false,
    type: 'object',
    properties: {
      sunday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      monday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      tuesday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      wednesday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      thursday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      friday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      },
      saturday: {
        type: 'object',
        properties: {
          startTime: {
            type: 'time',
            example: '10:00'
          },
          endTime: {
            type: 'time',
            example: '12:00'
          }
        }
      }
    }
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DayDto)
  daySchedules: DayDto;

  @ApiProperty({
    nullable: false,
    type: Boolean,
    default: false
  })
  @IsNotEmpty()
  @IsBoolean()
  is24Hr: boolean;
}
