import { BookingDto } from 'src/booking/dto/booking.dto';
import { BookingInitiationLogEntity } from 'src/booking/entity/booking-initiation-log.entity';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ISchedule } from 'src/schedule/entity/schedule.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { IPaymentPay } from './interface/payment-pay.interface';
import { IPayment } from './payment.interface';

export abstract class PaymentAbstract<T> implements IPayment<T> {
  protected status = TransactionStatusEnum.PAID;
  protected bookingInitiation: BookingInitiationLogEntity;

  abstract pay(paymentObj: IPaymentPay): Promise<T>;

  get transactionStatus(): TransactionStatusEnum {
    return this.status;
  }

  set transactionStatus(status: TransactionStatusEnum) {
    this.status = status;
  }

  get bookingInitiationLog(): BookingInitiationLogEntity {
    return this.bookingInitiation;
  }

  set bookingInitiationLog(bookingInitiation: BookingInitiationLogEntity) {
    this.bookingInitiation = bookingInitiation;
  }

  calculateServiceTotalAmount(service: ServiceEntity) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount;
  }
}
