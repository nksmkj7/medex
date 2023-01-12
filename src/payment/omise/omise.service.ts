import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as Omise from 'omise';
import { BookingDto } from 'src/booking/dto/booking.dto';
import { PaymentMethodEnum } from 'src/booking/enums/payment-method.enum';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { PaymentAbstract } from '../payment.abstract';

import * as config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IPaymentPay } from '../interface/payment-pay.interface';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
const appConfig = config.get('app');

@Injectable()
export class OmiseService extends PaymentAbstract<Omise.Charges.ICharge> {
  protected paymentStatus = {
    failed: 'failed',
    expired: 'expired',
    pending: 'pending',
    reserved: 'reserved',
    successful: 'successful'
  };

  constructor(
    @Inject('OMISE_CLIENT') private omise: Omise.IOmise,
    @InjectQueue(config.get('booking.queueName')) private bookingQueue: Queue
  ) {
    super();
  }

  async pay(paymentObj: IPaymentPay) {
    const { bookingDto, customer, service } = paymentObj;
    try {
      const bookingInitiation = this.bookingInitiation;
      const response = await this.verify(customer, bookingDto, service);
      const transactionStatus = this.transactionStatus(response['status']);
      this.bookingQueue.add('booking', {
        bookingInitiation,
        paymentResponse: response,
        transactionStatus
      });
      return response;
    } catch (error) {
      throw error;
    }
    // return this.verifyOtherPayment(customer, bookingDto, service);
  }

  verify(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    this.checkPaymentValidity(bookingDto, service);
    if (bookingDto.paymentMethod === PaymentMethodEnum.CARD) {
      return this.verifyOmiseCardPayment(customer, bookingDto, service);
    }
    return this.verifyOtherPayment(customer, bookingDto, service);
  }

  async verifyOmiseCardPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const omiseCustomer = await this.omise.customers.create({
      email: customer.email,
      card: bookingDto.token
    });
    return this.omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency: bookingDto.currency,
      customer: omiseCustomer.id
    });
  }

  async verifyOtherPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const { currency, token } = bookingDto;

    return this.omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      source: token,
      currency,
      return_uri: `${appConfig.frontendUrl}/booking`
    });
  }

  checkPaymentValidity(bookingDto: BookingDto, service: ServiceEntity) {
    if (
      Number(bookingDto.totalAmount) !==
      Number(this.calculateServiceTotalAmount(service))
    ) {
      throw new BadRequestException(
        "Sent amount doesn't match with the system calculated amount "
      );
    }
    return true;
  }

  transactionStatus(status: string) {
    const paid = [this.paymentStatus.successful];
    const unpaid = [
      this.paymentStatus.expired,
      this.paymentStatus.reserved,
      this.paymentStatus.pending
    ];
    if (paid.includes(status)) return TransactionStatusEnum.PAID;
    if (unpaid.includes(status)) return TransactionStatusEnum.UNPAID;
    return TransactionStatusEnum.FAILED;
  }
}
