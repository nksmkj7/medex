import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import * as config from 'config';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const basicFieldGroupsForSerializing: string[] = ['basic'];
const appConfig = config.get('app');

export class MenuSerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  position: string;

  @ApiPropertyOptional()
  link: string;

  @ApiProperty({
    name: 'status',
    enum: [true, false],
    enumName: 'status'
  })
  status: boolean;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  updatedAt: Date;
}
