import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { IsTime } from 'src/common/validators/time-only.decorator';

class ScheduleDto {
  @IsNotEmpty()
  @IsTime('12h')
  startTime: string;

  @IsNotEmpty()
  @IsTime('12h')
  endTime: string;
}

class DayDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  sunday: ScheduleDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  monday: ScheduleDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  tuesday: ScheduleDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  wednesday: ScheduleDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  thursday: ScheduleDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  friday: ScheduleDto;

  @IsNotEmptyObject()
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
    type: Boolean
  })
  @IsNotEmpty()
  @IsBoolean()
  is24Hr: boolean;
}
