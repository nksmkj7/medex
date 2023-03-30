import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { Column, Entity, ObjectLiteral } from 'typeorm';
import {
  BookingData,
  TransactionData
} from '../interface/booking-initiation-log.interface';
@Entity('booking_initiation_logs')
export class BookingInitiationLogEntity extends CustomUuidBaseEntity {
  @Column('jsonb', {
    nullable: false
  })
  bookingData: BookingData;

  @Column('jsonb', {
    nullable: false
  })
  transactionData: TransactionData;

  @Column('boolean', {
    default: false
  })
  bookingCreated: boolean;

  @Column('jsonb', {
    nullable: true
  })
  initialResponse: ObjectLiteral;
}
