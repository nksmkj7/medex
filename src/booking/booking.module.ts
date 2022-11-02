import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from 'src/customer/customer.module';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [
    CustomerModule,
    TypeOrmModule.forFeature([
      ScheduleRepository,
      BookingRepository,
      TransactionRepository
    ])
  ]
})
export class BookingModule {}
