import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BookingService } from './booking.service';
import * as config from 'config';

@Processor(config.get('booking.queueName'))
export class BookingProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly bookingService: BookingService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data
      )}`
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result
      )}`
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack
    );
  }

  @Process('booking')
  async book(job: Job): Promise<any> {
    const { bookingInitiation, paymentResponse, transactionStatus } = job.data;
    try {
      return this.bookingService.storeBooking(
        bookingInitiation,
        paymentResponse,
        transactionStatus
      );
    } catch (error) {
      this.logger.error(error.stack);
      throw error;
    }
  }
}
