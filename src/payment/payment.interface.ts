import { BookingDto } from 'src/booking/dto/booking.dto';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';

export interface IPayment<T> {
  pay(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity
  ): Promise<T>;
}
