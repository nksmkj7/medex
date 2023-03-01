import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { BookingEntity } from '../entity/booking.entity';

export type BookingData = Pick<
  BookingEntity,
  | 'customerId'
  | 'scheduleId'
  | 'scheduleDate'
  | 'serviceStartTime'
  | 'serviceEndTime'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'dialCode'
  | 'scheduleTimeId'
  | 'numberOfPeople'
  | 'address'
>;

export type TransactionData = Pick<
  TransactionEntity,
  | 'customerId'
  | 'price'
  | 'discount'
  | 'serviceCharge'
  | 'totalAmount'
  | 'currency'
  | 'paymentMethod'
  | 'paymentGateway'
  | 'transactionCode'
>;
