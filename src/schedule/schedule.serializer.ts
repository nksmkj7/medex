import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import * as config from 'config';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { CategorySerializer } from 'src/category/serializer/category.serializer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { SpecialistSerializer } from 'src/specialist/serializer/specialist.serializer';
import { ServiceSerializer } from 'src/service/service.serializer';
const appConfig = config.get('app');

export class ScheduleSerializer extends ModelSerializer {
  @Type(() => SpecialistSerializer)
  specialist: SpecialistSerializer;

  @Type(() => ServiceSerializer)
  service: CategorySerializer;

  @Type(() => UserSerializer)
  user: UserSerializer;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
