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
import { BookingProcessor } from './booking.processor';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingProcessor],
  imports: [
    CustomerModule,
    TypeOrmModule.forFeature([
      ScheduleRepository,
      BookingRepository,
      TransactionRepository
    ])
  ],
  exports: [BookingService, BookingProcessor]
})
export class BookingModule {}
