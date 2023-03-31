import {
  Inject,
  Injectable,
  RawBodyRequest,
  UnprocessableEntityException
} from '@nestjs/common';

import { PaymentAbstract } from '../payment.abstract';
import Stripe from 'stripe';
import { Request } from 'express';
import { IPaymentPay } from '../interface/payment-pay.interface';
import { InjectQueue } from '@nestjs/bull';
import * as config from 'config';
import { Queue } from 'bull';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { BookingInitiationLogEntity } from 'src/booking/entity/booking-initiation-log.entity';
import { TransactionStatusEnum } from 'src/booking/enums/transaction-status.enum';
import { BookingData } from 'src/booking/interface/booking-initiation-log.interface';

@Injectable()
export class StripeService extends PaymentAbstract<
  Stripe.Response<Stripe.PaymentIntent>
> {
  protected paymentStatus = {
    requires_payment_method: 'requires_payment_method',
    requires_confirmation: 'requires_confirmation',
    requires_action: 'requires_action',
    processing: 'processing',
    canceled: 'canceled',
    succeeded: 'succeeded'
  };
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    @InjectQueue(config.get('booking.queueName')) private bookingQueue: Queue,
    @InjectConnection() private connection: Connection
  ) {
    super();
  }

  async pay(paymentObj: IPaymentPay) {
    const { bookingDto, service } = paymentObj;
    const bookingInitiation = this.bookingInitiation;
    const customer = await this.customer(this.bookingInitiation.bookingData);
    console.log(
      {
        amount: Number(
          (
            this.calculateServiceTotalAmount(
              service,
              bookingDto?.numberOfPeople ?? 1
            ) * 100
          ).toFixed(2)
        ),
        currency: bookingDto.currency,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          bookingInitiationId: bookingInitiation.id
        },
        customer: customer.id,
        description: service.shortDescription
      },
      '------>'
    );
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Number(
        (
          this.calculateServiceTotalAmount(
            service,
            bookingDto?.numberOfPeople ?? 1
          ) * 100
        ).toFixed(2)
      ),
      currency: bookingDto.currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        bookingInitiationId: bookingInitiation.id
      },
      customer: customer.id,
      description: service.shortDescription
    });
    return paymentIntent;
  }

  async handleWebHook(request: RawBodyRequest<Request>) {
    let event: Stripe.Event;

    const endpointSecret = process.env.STRIPE_WEB_HOOK_SECRET_KEY;
    if (endpointSecret) {
      const signature = request.headers['stripe-signature'];
      try {
        event = this.stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        throw new UnprocessableEntityException(
          `⚠️  Webhook signature verification failed.`,
          err.message
        );
      }
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent: Stripe.PaymentIntent = event.data
          .object as Stripe.PaymentIntent;
        const bookingInitiationId = paymentIntent.metadata.bookingInitiationId;
        const manager = this.connection.manager;
        const bookingInitiation = await manager.findOne(
          BookingInitiationLogEntity,
          {
            id: bookingInitiationId
          }
        );
        const transactionStatus = this.transactionStatus(paymentIntent.status);
        this.bookingQueue.add(
          'booking',
          {
            bookingInitiation,
            paymentResponse: event,
            transactionStatus
          },
          { attempts: 3, removeOnComplete: true, removeOnFail: true }
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
  }

  transactionStatus(status: string) {
    const paid = [this.paymentStatus.succeeded];
    const unpaid = [
      this.paymentStatus.processing,
      this.paymentStatus.requires_action,
      this.paymentStatus.requires_confirmation,
      this.paymentStatus.requires_payment_method
    ];
    if (paid.includes(status)) return TransactionStatusEnum.PAID;
    if (unpaid.includes(status)) return TransactionStatusEnum.UNPAID;
    return TransactionStatusEnum.FAILED;
  }

  customer(bookingData: BookingData) {
    const { firstName, lastName, email, phone, customerId, dialCode } =
      bookingData;
    return this.stripe.customers.create({
      email: email,
      metadata: {
        customerId
      },
      name: `${firstName} ${lastName}`,
      phone: `${dialCode}${phone}`
    });
  }
}
