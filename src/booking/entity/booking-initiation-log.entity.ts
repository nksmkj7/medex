import { OmitType } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { BookingEntity } from './booking.entity';

export class BookingInitiationLogEntity extends OmitType(BookingEntity, [
  'status'
]) {
  @Column('boolean', {
    default: false
  })
  bookingCreated: boolean;
}
