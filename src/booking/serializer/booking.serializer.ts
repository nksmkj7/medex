import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import * as config from 'config';
import { BookingStatusEnum } from '../enums/booking-status.enum';
import { CustomerSerializer } from 'src/customer/serializer/customer.serializer';
import { ScheduleSerializer } from 'src/schedule/schedule.serializer';
import { TransactionSerializer } from 'src/transaction/transaction.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const basicFieldGroupsForSerializing: string[] = ['basic', 'customer'];
const appConfig = config.get('app');

export class BookingSerializer extends ModelSerializer {
  id: string;

  @ApiProperty()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  customerId: string;

  @ApiProperty()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  scheduleId: string;

  @ApiProperty()
  scheduleDate: Date;

  @ApiProperty()
  serviceStartTime: number;

  @ApiProperty()
  serviceEndTime: number;

  @ApiProperty({
    name: 'status',
    enum: BookingStatusEnum,
    enumName: 'status'
  })
  status: BookingStatusEnum;

  @ApiPropertyOptional()
  // @Expose({
  //   groups: adminUserGroupsForSerializing
  // })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  updatedAt: Date;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  @Type(() => CustomerSerializer)
  @Exclude({
    toPlainOnly: true
  })
  customer: CustomerSerializer;

  @ApiProperty()
  @Type(() => ScheduleSerializer)
  @Exclude({
    toPlainOnly: true
  })
  schedule: ScheduleSerializer;

  @ApiProperty()
  @Type(() => TransactionSerializer)
  @Expose({
    groups: [...adminUserGroupsForSerializing]
  })
  transactions: TransactionSerializer[];

  @ApiProperty()
  @Expose({
    groups: [...basicFieldGroupsForSerializing]
  })
  paymentStatus: string;
}
