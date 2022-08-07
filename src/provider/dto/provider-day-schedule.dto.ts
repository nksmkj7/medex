import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsJSON,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested
  // MinLength,
} from 'class-validator';
import { IsTime } from 'src/common/validators/time-only.decorator';

class ScheduleDto {
  @IsNotEmpty()
  @IsTime('12h', {
    message: 'time haleko milena'
  })
  startTime: string;

  @IsNotEmpty()
  @IsTime('12h')
  endTime: string;
}

class DayDto {
  // @Transform(({ value }) => console.log(value, 'asdfasfdasdf'))
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  sunday: ScheduleDto;
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
