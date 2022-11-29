import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ScheduleEntity } from 'src/schedule/entity/schedule.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique
} from 'typeorm';
import { BookingStatusEnum } from '../enums/booking-status.enum';

@Entity({
  name: 'bookings'
})
export class BookingEntity extends CustomBaseEntity {
  @Column('varchar', {
    nullable: false
  })
  firstName: string;

  @Column('varchar', {
    nullable: false
  })
  lastName: string;

  @Column('varchar', {
    nullable: false
  })
  email: string;

  @Column('varchar', {
    nullable: false
  })
  phone: string;

  @Column('varchar', {
    nullable: false
  })
  customerId: string;

  @Column('varchar', {
    nullable: false
  })
  scheduleId: string;

  @Column('date', {
    nullable: false
  })
  scheduleDate: Date;

  @Column('time', {
    nullable: false
  })
  serviceStartTime: string;

  @Column('time', {
    nullable: true
  })
  serviceEndTime: string;

  @Column('varchar', {
    default: BookingStatusEnum.PENDING
  })
  status: BookingStatusEnum;

  @OneToOne(() => CustomerEntity)
  @JoinColumn({
    name: 'customerId',
    referencedColumnName: 'id'
  })
  customer: CustomerEntity;

  @OneToOne((type) => {
    return ScheduleEntity;
  })
  @JoinColumn({
    name: 'scheduleId',
    referencedColumnName: 'id'
  })
  schedule: ScheduleEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.booking)
  transactions: TransactionEntity[];

  paymentStatus: string;

  @AfterLoad()
  afterLoad() {
    this.paymentStatus =
      this.transactions && Array.isArray(this.transactions)
        ? this.transactions[this.transactions.length - 1].status
        : 'unpaid';
  }
}
