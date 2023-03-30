import {
  BadRequestException,
  Inject,
  Injectable,
  RawBodyRequest
} from '@nestjs/common';
import * as Omise from 'omise';
import { BookingDto } from 'src/booking/dto/booking.dto';
import { PaymentMethodEnum } from 'src/booking/enums/payment-method.enum';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { PaymentAbstract } from '../payment.abstract';
import { Request } from 'express';

import * as config from 'config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IPaymentPay } from '../interface/payment-pay.interface';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { BookingInitiationLogEntity } from 'src/booking/entity/booking-initiation-log.entity';

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
    @InjectQueue(config.get('booking.queueName')) private bookingQueue: Queue,
    @InjectConnection() private connection: Connection
  ) {
    super();
  }

  async pay(paymentObj: IPaymentPay) {
    const { bookingDto, customer, service } = paymentObj;
    try {
      const bookingInitiation = this.bookingInitiation;
      return this.verify(customer, bookingDto, service, bookingInitiation);
      // const transactionStatus = this.transactionStatus(response['status']);
      // this.bookingQueue.add('booking', {
      //   bookingInitiation,
      //   paymentResponse: response,
      //   transactionStatus
      // });
    } catch (error) {
      throw error;
    }
    // return this.verifyOtherPayment(customer, bookingDto, service);
  }

  verify(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity,
    bookingInitiation: BookingInitiationLogEntity
  ) {
    this.checkPaymentValidity(bookingDto, service);
    if (bookingDto.paymentMethod === PaymentMethodEnum.CARD) {
      return this.verifyOmiseCardPayment(
        customer,
        bookingDto,
        service,
        bookingInitiation
      );
    }
    return this.verifyOtherPayment(
      customer,
      bookingDto,
      service,
      bookingInitiation
    );
  }

  async verifyOmiseCardPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity,
    bookingInitiation: BookingInitiationLogEntity
  ) {
    const omiseCustomer = await this.omise.customers.create({
      email: customer.email,
      card: bookingDto.token
    });
    const response = await this.omise.charges.create({
      amount:
        this.calculateServiceTotalAmount(
          service,
          bookingDto?.numberOfPeople ?? 1
        ) * 100,
      currency: bookingDto.currency,
      customer: omiseCustomer.id
    });
    const transactionStatus = this.transactionStatus(response['status']);
    console.log(
      transactionStatus,
      'transaction status from omise card payment --->'
    );
    this.bookingQueue.add('booking', {
      bookingInitiation,
      paymentResponse: response,
      transactionStatus
    });
    return response;
  }

  async verifyOtherPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity,
    bookingInitiation: BookingInitiationLogEntity
  ) {
    const { currency, token } = bookingDto;
    return this.omise.charges.create({
      amount:
        this.calculateServiceTotalAmount(
          service,
          bookingDto?.numberOfPeople ?? 1
        ) * 100,
      source: token,
      currency,
      return_uri: `${appConfig.customerEndUrl}/profile/bookings`,
      metadata: {
        bookingInitiationId: bookingInitiation.id
      }
    });
  }

  checkPaymentValidity(bookingDto: BookingDto, service: ServiceEntity) {
    if (
      Number(bookingDto.totalAmount) !==
      Number(
        this.calculateServiceTotalAmount(
          service,
          bookingDto?.numberOfPeople ?? 1
        )
      )
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

  async handleWebHook(request: RawBodyRequest<Request>) {
    const event = request.body;
    switch (event.key) {
      case 'charge.complete':
        const bookingInitiationId =
          request.body.data.metadata.bookingInitiationId;
        const manager = this.connection.manager;
        const charge = await this.omise.charges.retrieve(event.data.id);
        const bookingInitiation = await manager.findOne(
          BookingInitiationLogEntity,
          {
            id: bookingInitiationId
          }
        );
        const transactionStatus =
          charge['status'] === event.data.status
            ? this.transactionStatus(event.data.status)
            : TransactionStatusEnum.FAILED;
        this.bookingQueue.add('booking', {
          bookingInitiation,
          paymentResponse: event,
          transactionStatus
        });
        break;
      default:
        console.log(`Unhandled event type ${event.key}.`);
    }
  }
}
