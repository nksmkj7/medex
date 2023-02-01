import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from 'src/customer/customer.module';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';

import * as config from 'config';
import { BackOfficeProcessor } from './backoffice.processor';

const mailConfig = config.get('mail');
const queueConfig = config.get('queue');

@Module({
  controllers: [BookingController],
  providers: [BookingService, BackOfficeProcessor],
  imports: [
    CustomerModule,
    TypeOrmModule.forFeature([
      ScheduleRepository,
      BookingRepository,
      TransactionRepository
    ]),
    BullModule.registerQueueAsync({
      name: config.get('backOffice.queueName'),
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
  ]
})
export class BookingModule {}
