import { BookingEntity } from 'src/booking/entity/booking.entity';
import { PaymentGatewayEnum } from 'src/booking/enums/payment-gateway.enum';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ScheduleEntity } from 'src/schedule/entity/schedule.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique
} from 'typeorm';

@Entity({
  name: 'transactions'
})
@Unique(['transactionCode'])
export class TransactionEntity extends CustomBaseEntity {
  @Column('varchar', {
    nullable: false
  })
  bookingId: string;

  @Column('varchar', {
    nullable: false
  })
  customerId: string;

  @Column('decimal', { default: 0, precision: 4, scale: 4 })
  discount: number;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  serviceCharge: number;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  price: number;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  totalAmount: number;

  @Column('varchar', {
    nullable: false,
    unique: true
  })
  transactionCode: string;

  @Column('varchar', {
    default: TransactionStatusEnum.UNPAID
  })
  status: TransactionStatusEnum;

  @Column('jsonb')
  response_json: { [index: string]: any };

  @Column('varchar')
  currency: string;

  @Column('enum', {
    nullable: true,
    enum: [PaymentGatewayEnum['2C2P'], PaymentGatewayEnum.OMISE]
  })
  paymentGateway: PaymentGatewayEnum;

  @OneToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customerId',
    referencedColumnName: 'id'
  })
  customer: CustomerEntity;

  @OneToOne(() => BookingEntity)
  @JoinColumn({
    name: 'bookingId',
    referencedColumnName: 'id'
  })
  schedule: BookingEntity;

  @ManyToOne(() => BookingEntity, (booking) => booking.transactions)
  booking: BookingEntity;
}
