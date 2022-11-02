import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { CustomerSerializer } from 'src/customer/serializer/customer.serializer';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { BookingSerializer } from 'src/booking/serializer/booking.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const basicFieldGroupsForSerializing: string[] = ['basic', 'customer'];

export class TransactionSerializer extends ModelSerializer {
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
  bookingId: string;

  @ApiProperty()
  scheduleDate: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  serviceCharge: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  @Exclude({
    toPlainOnly: true
  })
  transactionCode: number;

  @ApiProperty({
    name: 'status',
    enum: TransactionStatusEnum,
    enumName: 'status'
  })
  status: TransactionStatusEnum;

  @ApiPropertyOptional()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: adminUserGroupsForSerializing
  })
  updatedAt: Date;

  @ApiProperty()
  @Type(() => CustomerSerializer)
  @Exclude({
    toPlainOnly: true
  })
  customer: CustomerSerializer;

  @ApiProperty()
  @Type(() => BookingSerializer)
  @Exclude({
    toPlainOnly: true
  })
  booking: BookingSerializer;
}
