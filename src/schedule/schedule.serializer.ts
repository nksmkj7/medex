import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { TimeDto } from './dto/schedule.dto';

export class ScheduleSerializer extends ModelSerializer {
  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  specialistId: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  schedules: TimeDto;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
