import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';

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

  @ApiHideProperty()
  @Expose({
    groups: ['children']
  })
  @Type(() => MenuSerializer)
  parent: MenuSerializer;

  @ApiHideProperty()
  @Expose({
    groups: ['parent']
  })
  @Type(() => MenuSerializer)
  children: MenuSerializer;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}