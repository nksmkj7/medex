import { BookingInitiationLogEntity } from 'src/booking/entity/booking-initiation-log.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { IPaymentPay } from './interface/payment-pay.interface';
import { IPayment } from './payment.interface';

export abstract class PaymentAbstract<T> implements IPayment<T> {
  protected bookingInitiation: BookingInitiationLogEntity;

  abstract pay(paymentObj: IPaymentPay): Promise<T>;

  get bookingInitiationLog(): BookingInitiationLogEntity {
    return this.bookingInitiation;
  }

  set bookingInitiationLog(bookingInitiation: BookingInitiationLogEntity) {
    this.bookingInitiation = bookingInitiation;
  }

  calculateServiceTotalAmount(service: ServiceEntity, numberOfPerson = 1) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return (
      (priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount) *
      numberOfPerson
    );
  }

  abstract transactionStatus(status: string): string;
}
