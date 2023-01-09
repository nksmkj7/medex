import {
  Inject,
  Injectable,
  RawBodyRequest,
  UnprocessableEntityException
} from '@nestjs/common';
import { BookingDto } from 'src/booking/dto/booking.dto';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { PaymentAbstract } from '../payment.abstract';
import Stripe from 'stripe';
import { BookingEntity } from 'src/booking/entity/booking.entity';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from 'src/transaction/transaction.repository';

@Injectable()
export class StripeService extends PaymentAbstract<
  Stripe.Response<Stripe.PaymentIntent>
> {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository
  ) {
    super();
  }

  async pay(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity,
    booking: BookingEntity
  ) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency: bookingDto.currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        booking_id: booking.id
      }
    });
    return paymentIntent;
  }

  async handleWebHook(request: RawBodyRequest<Request>) {
    let event: Stripe.Event;

    const endpointSecret =
      'whsec_7678047e966bae21f82b84ef126dd08cc7c66bf857242db13a39218c70ed9500';
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature'];
      //   console.log(request, 'request is --->');
      //   return;

      try {
        event = this.stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(err);
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
        const bookingId = paymentIntent.metadata.booking_id;
        // await this.transactionRepository.update({
        //   bookingId
        // });
        // console.log(paymentIntent.metadata, '------>');
        // console.log(
        //   `PaymentIntent for ${paymentIntent.amount} was successful!`
        // );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}
