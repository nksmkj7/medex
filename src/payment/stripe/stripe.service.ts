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

@Injectable()
export class StripeService extends PaymentAbstract<
  Stripe.Response<Stripe.PaymentIntent>
> {
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
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency: bookingDto.currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        bookingInitiationId: bookingInitiation.id
      }
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
        this.bookingQueue.add('booking', {
          bookingInitiation,
          paymentResponse: event
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}
