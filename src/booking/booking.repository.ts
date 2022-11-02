import { EntityRepository } from 'typeorm';

import { BaseRepository } from 'src/common/repository/base.repository';

import { BookingSerializer } from './serializer/booking.serializer';
import { BookingEntity } from './entity/booking.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import { ModelSerializer } from 'src/common/serializer/model.serializer';

@EntityRepository(BookingEntity)
export class BookingRepository extends BaseRepository<
  BookingEntity,
  BookingSerializer
> {
  transform(model: BookingEntity, transformOption = {}): BookingSerializer {
    return plainToClass(
      BookingSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: BookingEntity[],
    transformOption = {}
  ): BookingSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
