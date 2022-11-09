import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { generateUniqueToken } from 'src/common/helper/general.helper';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ScheduleRepository } from 'src/schedule/schedule.repository';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { TransactionEntity } from 'src/transaction/entity/transaction.entity';
import { TransactionRepository } from 'src/transaction/transaction.repository';
import { Connection, ILike } from 'typeorm';
import { BookingRepository } from './booking.repository';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingUpdateStatusDto } from './dto/booking-update-status.dto';
import { BookingDto } from './dto/booking.dto';
import { BookingEntity } from './entity/booking.entity';
import { basicFieldGroupsForSerializing } from './serializer/booking.serializer';
import * as Omise from 'omise';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentGatewayException } from 'src/exception/payment-gateway.exception';
import { TransactionStatusEnum } from './enums/transaction-status.enum';

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

  @Public()
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
      let paymentResponse = {};
      try {
        paymentResponse = await this.verifyPayment(
          bookingDto,
          customer,
          service
        );
      } catch (error) {
        paymentResponse = error.message;
        throw new PaymentGatewayException(error.message);
      }
      transaction.response_json = paymentResponse;
      transaction.currency = bookingDto.currency;
      transaction.paymentGateway = bookingDto.paymentGateway;
      transaction.status = TransactionStatusEnum.PAID;
      await manager.save(transaction);
      await queryRunner.commitTransaction();
      //   booking.transactions = [transaction];
      return booking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyPayment(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity
  ) {
    const omise = Omise({
      publicKey: process.env.OMISE_PUBLIC_KEY,
      secretKey: process.env.OMISE_SECRET_KEY
    });
    const { token, currency } = bookingDto;
    const omiseCustomer = await omise.customers.create({
      email: customer.email,
      card: token
    });

    return omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency,
      customer: omiseCustomer.id
    });
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
    const bookings = await this.repository.paginate(
      {},
      [],
      [],
      {
        groups: [...basicFieldGroupsForSerializing]
      },
      {
        customerId: customer.id
      }
    );
    return bookings;
  }

  findAll(bookingFilterDto: BookingFilterDto) {
    const { keywords } = bookingFilterDto;
    let relationalSearchCriteria = {};
    if (keywords) {
      relationalSearchCriteria = {
        ...relationalSearchCriteria,
        customer: [
          {
            firstName: ILike(`%${keywords}%`)
          },
          {
            lastName: ILike(`%${keywords}%`)
          }
        ]
      };
    }
    return this.repository.paginate(
      bookingFilterDto,
      ['customer', 'transactions', 'schedule', 'schedule.service'],
      ['firstName', 'lastName', 'email', 'phone'],
      {}
    );
  }

  async bookingById(bookingId: string) {
    const booking = await this.repository.findOneOrFail(bookingId, {
      relations: [
        'customer',
        'schedule',
        'schedule.service',
        'schedule.specialist'
      ]
    });
    return this.repository.transform(booking);
  }

  async updateBookingStatus(
    bookingId: string,
    bookingUpdateStatusDto: BookingUpdateStatusDto
  ) {
    const booking = await this.repository.findOneOrFail(bookingId);
    booking.status = bookingUpdateStatusDto.status;
    await booking.save();
    return this.repository.transform(booking);
  }
}
