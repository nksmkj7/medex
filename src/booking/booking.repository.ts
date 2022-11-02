import { EntityRepository } from 'typeorm';

import { BaseRepository } from 'src/common/repository/base.repository';

import { BookingSerializer } from './serializer/booking.serializer';
import { BookingEntity } from './entity/booking.entity';

@EntityRepository(BookingEntity)
export class BookingRepository extends BaseRepository<
  BookingEntity,
  BookingSerializer
> {}
