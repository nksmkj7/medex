import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { generateUniqueToken } from 'src/common/helper/general.helper';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { Connection } from 'typeorm';
import { BookingRepository } from './booking.repository';
import { BookingDto } from './dto/booking.dto';
import { BookingEntity } from './entity/booking.entity';

@Injectable()
export class BookingService {
  transactionCodeLength: number;
  constructor(
    private readonly repository: BookingRepository,
    @InjectRepository(ScheduleRepository)
    private readonly scheduleRepository: ScheduleRepository,
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    @InjectConnection()
    private readonly connection: Connection
  ) {
    this.transactionCodeLength = 16;
  }

  async storeBooking(bookingDto: BookingDto, customer: CustomerEntity) {
    const schedule = await this.scheduleRepository.findOne(
      bookingDto.scheduleId,
      {
        where: {
          serviceId: bookingDto.serviceId,
          specialistId: bookingDto.specialistId,
          date: bookingDto.scheduleDate
        },
        relations: ['service']
      }
    );
    if (!schedule) {
      throw new UnprocessableEntityException('Schedule not found.');
    }
    const scheduleTime = schedule.schedules.find(
      (time) => time.id === bookingDto.scheduleTimeId
    );
    if (!scheduleTime || scheduleTime.isBooked) {
      throw new UnprocessableEntityException('Schedule not available');
    }
    scheduleTime['isBooked'] = true;
    const service = schedule.service;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.save(schedule);
      const booking = new BookingEntity();
      booking.customerId = customer.id;
      booking.scheduleId = schedule.id;
      booking.scheduleDate = schedule.date;
      booking.serviceStartTime = scheduleTime.startTime;
      booking.serviceEndTime = scheduleTime.endTime;
      booking.firstName = bookingDto.firstName;
      booking.lastName = bookingDto.lastName;
      booking.email = bookingDto.email;
      booking.phone = bookingDto.phone;
      await manager.save(booking);
      const transaction = await this.getBookingTransaction(customer, service);
      transaction.booking = booking;
      await manager.save(transaction);
      await queryRunner.commitTransaction();
      //   booking.transactions = [transaction];
      return booking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  calculateServiceTotalAmount(service: ServiceEntity) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount;
  }

  async getBookingTransaction(
    customer: CustomerEntity,
    service: ServiceEntity
  ) {
    const transaction = new TransactionEntity();
    transaction.totalAmount = this.calculateServiceTotalAmount(service);
    transaction.transactionCode = await this.generateUniqueTransactionCode(
      customer
    );
    transaction.customerId = customer.id;
    transaction.price = service.price;
    transaction.discount = service.discount;
    transaction.serviceCharge = service.serviceCharge;
    return transaction;
  }

  async generateUniqueTransactionCode(customer: CustomerEntity) {
    const checkUniqueFn = async (token: string) => {
      const tokenCount =
        await this.transactionRepository.countEntityByCondition({
          customerId: customer.id,
          transactionCode: token
        });
      return tokenCount <= 0;
    };
    const transactionCode = await generateUniqueToken(
      this.transactionCodeLength,
      checkUniqueFn
    );
    return transactionCode;
  }

  async getCustomerBooking(customer: CustomerEntity) {
    const bookings = await this.repository.find({
      customerId: customer.id
    });
    return this.repository.transformMany(bookings, {
      groups: ['blabla']
    });
    // const bookings = await this.repository.paginate(
    //   {},
    //   [],
    //   [],
    //   {
    //     groups: [...basicFieldGroupsForSerializing]
    //   },
    //   {
    //     customerId: customer.id
    //   }
    // );
    // return bookings;
  }
}
