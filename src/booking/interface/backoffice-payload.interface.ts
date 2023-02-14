import { BookingStatusEnum } from '../enums/booking-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { TransactionStatusEnum } from '../enums/transaction-status.enum';

export interface IBackOfficePayload {
  package_title: string;
  package_included: string;
  provider_name: string;
  provider_address: string;
  unit_price: string;
  open_timing: string;
  prepayment_required: string;
  booking_info: {
    order_id: string;
    customer_name: string;
    phone: string;
    email: string;
    address: string;
    quantity: string;
    total_price: string;
    currency: string;
    discount_price: string;
    pay_status: string;
    status: string;
    package_id: string;
    linked_customer_name: string;
    memo: string;
    test_site: string;
    appointment_date: string;
    appointment_time: string;
    date_created: string;
  };
  dev?: boolean;
}
