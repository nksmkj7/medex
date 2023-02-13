import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { BullModule } from '@nestjs/bull';
import * as config from 'config';
const queueConfig = config.get('queue');

@Module({
  providers: [StripeService]
})
export class StripeModule {
  static register(stripeKey: string, options?: Stripe.StripeConfig) {
    const stripe = new Stripe(stripeKey, options);
    return {
      module: StripeModule,
      providers: [
        StripeService,
        {
          provide: 'STRIPE_CLIENT',
          useValue: stripe
        }
      ],
      imports: [
        BullModule.registerQueueAsync({
          name: config.get('booking.queueName'),
          useFactory: () => ({
            redis: {
              host: process.env.REDIS_HOST || queueConfig.host,
              port: process.env.REDIS_PORT || queueConfig.port,
              password: process.env.REDIS_PASSWORD || queueConfig.password,
              retryStrategy(times) {
                return Math.min(times * 50, 2000);
              }
            }
          })
        })
      ],
      exports: [StripeService],
      global: true
    };
  }
}
