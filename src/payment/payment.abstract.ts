import { BookingDto } from 'src/booking/dto/booking.dto';
import { BookingEntity } from 'src/booking/entity/booking.entity';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { IPayment } from './payment.interface';

export abstract class PaymentAbstract<T> implements IPayment<T> {
  //   protected transactionStatus: TransactionStatusEnum;
  protected status = TransactionStatusEnum.PAID;

  abstract pay(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity,
    booking?: BookingEntity
  ): Promise<T>;

  get transactionStatus(): TransactionStatusEnum {
    return this.status;
  }

  set transactionStatus(status: TransactionStatusEnum) {
    this.status = status;
  }

  calculateServiceTotalAmount(service: ServiceEntity) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount;
  }
}
