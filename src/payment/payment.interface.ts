import { IPaymentPay } from './interface/payment-pay.interface';

export interface IPayment<T> {
  pay(paymentObj: IPaymentPay): Promise<T>;
}
