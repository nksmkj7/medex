import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from 'src/transaction/transaction.repository';

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
      imports: [TypeOrmModule.forFeature([TransactionRepository])],
      exports: [StripeService],
      global: true
    };
  }
}
