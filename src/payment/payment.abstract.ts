import { BookingDto } from 'src/booking/dto/booking.dto';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { IPayment } from './payment.interface';

export abstract class PaymentAbstract<T> implements IPayment<T> {
  abstract verifyPayment(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity
  ): Promise<T>;

  calculateServiceTotalAmount(service: ServiceEntity) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount;
  }
}
