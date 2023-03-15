import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import * as config from 'config';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { DiscountTypeEnum } from 'src/booking/enums/discount-type.enum';
import { CategorySerializer } from 'src/category/serializer/category.serializer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { SpecialistSerializer } from 'src/specialist/serializer/specialist.serializer';
const appConfig = config.get('app');

export class ServiceSerializer extends ModelSerializer {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  discount: number;

  @ApiProperty({
    name: 'discountType',
    enum: DiscountTypeEnum,
    enumName: 'discountType'
  })
  discountType: DiscountTypeEnum;

  @ApiProperty()
  durationInMinutes: number;

  @ApiProperty()
  serviceCharge: number;

  @ApiProperty({
    name: 'status',
    enum: [true, false],
    enumName: 'status'
  })
  status: boolean;

  //   @Expose({
  //     groups: ['children']
  //   })
  @Type(() => CategorySerializer)
  category: CategorySerializer;

  //   @Expose({
  //     groups: ['parent']
  //   })
  @Type(() => CategorySerializer)
  subCategory: CategorySerializer;

  @Type(() => UserSerializer)
  user: UserSerializer;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;

  @Exclude()
  specialists: SpecialistSerializer[];

  @ApiProperty()
  @Transform(({ value }) => {
    if (value) {
      value = value.split(',');
      if (Array.isArray(value)) {
        return value.map(
          (image) => `${appConfig.appUrl}/images/service/${image.trim()}`
        );
      }
      return `${appConfig.appUrl}/images/service/${value.trim()}`;
    }
    return null;
  })
  image: string[];
}
