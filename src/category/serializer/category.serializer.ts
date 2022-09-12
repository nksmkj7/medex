import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import * as config from 'config';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
const appConfig = config.get('app');

export class CategorySerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  isNew: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  position: string;

  @ApiProperty()
  @Transform(({ value }) =>
    value ? `${appConfig.appUrl}/images/category/${value}` : null
  )
  image: string;

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
  @Type(() => CategorySerializer)
  parent: CategorySerializer;

  @ApiHideProperty()
  @Expose({
    groups: ['parent']
  })
  @Type(() => CategorySerializer)
  children: CategorySerializer;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
