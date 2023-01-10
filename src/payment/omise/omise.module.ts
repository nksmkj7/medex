import { DynamicModule, Module } from '@nestjs/common';
import * as Omise from 'omise';
import { OmiseService } from './omise.service';
import * as config from 'config';
import { BullModule } from '@nestjs/bull';
import { BookingModule } from 'src/booking/booking.module';

const queueConfig = config.get('queue');

@Module({})
export class OmiseModule {
  static register(options: Omise.IOptions): DynamicModule {
    const { publicKey, secretKey } = options;
    const omise = Omise({
      publicKey,
      secretKey
    });
    return {
      module: OmiseModule,
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
        }),
        BookingModule
      ],
      providers: [
        OmiseService,
        {
          provide: 'OMISE_CLIENT',
          useValue: omise
        }
      ],
      exports: [OmiseService],
      global: true
    };
  }
}
