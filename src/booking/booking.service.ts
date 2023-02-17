import {
  Injectable,
  RawBodyRequest,
  UnprocessableEntityException
} from '@nestjs/common';
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
import { adminUserGroupsForSerializing } from './serializer/booking.serializer';
import * as Omise from 'omise';
import { PaymentGatewayException } from 'src/exception/payment-gateway.exception';
import { PaymentMethodEnum } from './enums/payment-method.enum';
import * as config from 'config';
import { CustomerBookingFilterDto } from './dto/customer-booking-filter.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ISchedule, ScheduleEntity } from 'src/schedule/entity/schedule.entity';
import dayjs = require('dayjs');
import { ModuleRef } from '@nestjs/core';
import { OmiseService } from 'src/payment/omise/omise.service';
import { StripeService } from 'src/payment/stripe/stripe.service';
import { Request } from 'express';
import { BookingInitiationLogEntity } from './entity/booking-initiation-log.entity';
import {
  BookingData,
  TransactionData
} from './interface/booking-initiation-log.interface';
import { TransactionStatusEnum } from './enums/transaction-status.enum';
import { ScheduleTypeEnum } from 'src/service/enums/schedule-type.enum';

const appConfig = config.get('app');

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
    private readonly connection: Connection,
    @InjectQueue(config.get('backOffice.queueName'))
    private backOfficeQueue: Queue,
    private moduleRef: ModuleRef
  ) {
    this.transactionCodeLength = 16;
  }

  async initiateBooking(bookingDto: BookingDto, customer: CustomerEntity) {
    const whereCondition = {
      serviceId: bookingDto.serviceId,
      date: bookingDto.scheduleDate
    };
    if (bookingDto.specialistId) {
      whereCondition['specialistId'] = bookingDto.specialistId;
    }
    const schedule = await this.scheduleRepository.findOne(
      bookingDto.scheduleId,
      {
        where: whereCondition,
        relations: [
          'service',
          'service.user',
          'service.user.providerInformation',
          'service.user.providerInformation.country'
        ]
      }
    );
    if (!schedule) {
      throw new UnprocessableEntityException('Schedule not found.');
    }
    const scheduleTime = schedule.schedules.find(
      (time) => time.id === bookingDto.scheduleTimeId
    );
    if (
      !scheduleTime ||
      (scheduleTime.isBooked &&
        schedule.service.scheduleType === ScheduleTypeEnum.SPEICIALIST_ONLY)
    ) {
      throw new UnprocessableEntityException('Schedule not available');
    }
    if (schedule.specialistId && !bookingDto.specialistId) {
      throw new UnprocessableEntityException(
        'Specialist has been assigned to schedule. Specialist is missing in booking'
      );
    }
    const scheduleDayTime = dayjs(
      `${schedule.date} ${scheduleTime.startTime}`,
      'YYYY-mm-dd HH:mm'
    );
    if (scheduleDayTime.isBefore(dayjs())) {
      throw new UnprocessableEntityException('Cannot booked past date.');
    }
    const service = schedule.service;
    const paymentService = this.getPaymentService(bookingDto.paymentGateway);
    let paymentResponse = {};
    try {
      paymentService.bookingInitiationLog =
        await this.storeBookingInitiationLog(
          schedule,
          customer,
          scheduleTime,
          bookingDto,
          service
        );
      paymentResponse = await paymentService.pay({
        bookingDto,
        customer,
        service,
        scheduleTime
      });
    } catch (error) {
      throw new PaymentGatewayException(error.message);
    }
    return paymentResponse;
  }

  getPaymentService(paymentGateway: string) {
    switch (paymentGateway) {
      case 'omise':
        return this.moduleRef.get(OmiseService, { strict: false });
      case 'stripe':
        return this.moduleRef.get(StripeService, { strict: false });
      default:
        throw new UnprocessableEntityException('Unknown payment method');
    }
  }

  // async verifyPayment(
  //   bookingDto: BookingDto,
  //   customer: CustomerEntity,
  //   service: ServiceEntity
  // ) {
  //   const omise = Omise({
  //     publicKey: process.env.OMISE_PUBLIC_KEY,
  //     secretKey: process.env.OMISE_SECRET_KEY
  //   });

  //   if (bookingDto.paymentMethod === PaymentMethodEnum.CARD) {
  //     return this.verifyOmiseCardPayment(omise, customer, bookingDto, service);
  //   }
  //   return this.verifyOtherPayment(omise, customer, bookingDto, service);
  // }

  // async verifyOmiseCardPayment(
  //   omise: Omise.IOmise,
  //   customer: CustomerEntity,
  //   bookingDto: BookingDto,
  //   service: ServiceEntity
  // ) {
  //   const omiseCustomer = await omise.customers.create({
  //     email: customer.email,
  //     card: bookingDto.token
  //   });
  //   return omise.charges.create({
  //     amount:
  //       this.calculateServiceTotalAmount(
  //         service,
  //         bookingDto?.numberOfPeople ?? 1
  //       ) * 100,
  //     currency: bookingDto.currency,
  //     customer: omiseCustomer.id
  //   });
  // }

  // async verifyOtherPayment(
  //   omise: Omise.IOmise,
  //   customer: CustomerEntity,
  //   bookingDto: BookingDto,
  //   service: ServiceEntity
  // ) {
  //   const { currency, token } = bookingDto;

  //   return omise.charges.create({
  //     amount:
  //       this.calculateServiceTotalAmount(
  //         service,
  //         bookingDto?.numberOfPeople ?? 1
  //       ) * 100,
  //     source: token,
  //     currency,
  //     return_uri: `${appConfig.frontendUrl}/booking`
  //   });
  // }

  calculateServiceTotalAmount(service: ServiceEntity, numberOfPeople = 1) {
    const price = +service.price;
    const serviceCharge = +service.serviceCharge;
    const discount = +service.discount;
    const priceAfterDiscount = price - (discount / 100) * price;
    return (
      (priceAfterDiscount + (serviceCharge / 100) * priceAfterDiscount) *
      numberOfPeople
    );
  }

  // async getBookingTransaction(
  //   customer: CustomerEntity,
  //   service: ServiceEntity
  // ) {
  //   const transaction = new TransactionEntity();
  //   transaction.totalAmount = this.calculateServiceTotalAmount(service);
  //   transaction.transactionCode = await this.generateUniqueTransactionCode(
  //     customer
  //   );
  //   transaction.customerId = customer.id;
  //   transaction.price = service.price;
  //   transaction.discount = service.discount;
  //   transaction.serviceCharge = service.serviceCharge;
  //   return transaction;
  // }

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

  async getCustomerBooking(
    customer: CustomerEntity,
    customerBookingFilterDto: CustomerBookingFilterDto
  ) {
    const { limit = 10, page = 1 } = customerBookingFilterDto;
    const offset = (page - 1) * limit;
    const bookings = await this.connection.manager.query(
      `SELECT booking.*,
      "service"."title" as serviceTitle, 
      "pi"."companyName" as "providerCompanyName", 
      "pi"."businessLogo" as "providerBusinessLogo",
      transaction."status" as "paymentStatus"
      FROM "bookings" "booking" 
      LEFT JOIN "schedules" "schedule" ON "schedule"."id" = "booking"."scheduleId"
      LEFT JOIN "services" "service" ON "service"."id" = "schedule"."serviceId" 
      LEFT JOIN "user" "user" ON "user"."id" = "service"."userId" 
      LEFT JOIN "provider_informations" "pi" ON "pi"."userId" = "user"."id"
      left join (select * from 
        (select t."status",t."bookingId" ,ROW_NUMBER() OVER (PARTITION BY t."bookingId")
        from transactions t
        inner join bookings b
        on b.id = t."bookingId"
        where b."customerId" = $1
        order by t."createdAt" desc ) as a
      where a."row_number" = 1) "transaction"
      on transaction."bookingId" = "booking"."id"
      WHERE "booking"."customerId" =$2 
      order by booking."createdAt" desc
      limit $3 offset $4
      `,
      [customer.id, customer.id, limit, offset]
    );

    const totalCustomerBooking = await this.connection
      .createEntityManager()
      .count(BookingEntity, {
        where: {
          customerId: customer.id
        }
      });

    return {
      results: bookings,
      totalItems: totalCustomerBooking,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: totalCustomerBooking > offset + limit ? page + 1 : 0
    };
  }

  findAll(bookingFilterDto: BookingFilterDto) {
    const { keywords, provider } = bookingFilterDto;
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
    if (provider) {
      relationalSearchCriteria = {
        ...relationalSearchCriteria,
        schedule: {
          service: {
            userId: provider
          }
        }
      };
    }

    return this.repository.paginate(
      bookingFilterDto,
      [
        'customer',
        'transactions',
        'schedule',
        'schedule.service',
        'schedule.service.user'
      ],
      ['firstName', 'lastName', 'email', 'phone'],
      { groups: adminUserGroupsForSerializing },
      {},
      relationalSearchCriteria
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

  handleStripeEventHook(req: RawBodyRequest<Request>) {
    const stripeService = this.moduleRef.get(StripeService, { strict: false });
    return stripeService.handleWebHook(req);
  }

  async storeBookingInitiationLog(
    schedule: ScheduleEntity,
    customer: CustomerEntity,
    scheduleTime: ISchedule,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const booking: BookingData = {
        customerId: customer.id,
        scheduleId: schedule.id,
        scheduleDate: schedule.date,
        serviceStartTime: scheduleTime.startTime,
        serviceEndTime: scheduleTime.endTime,
        firstName: bookingDto.firstName,
        lastName: bookingDto.lastName,
        email: bookingDto.email,
        phone: bookingDto.phone,
        dialCode: bookingDto.dialCode,
        scheduleTimeId: bookingDto.scheduleTimeId,
        numberOfPeople: bookingDto.numberOfPeople
      };

      const transaction: TransactionData = {
        totalAmount: this.calculateServiceTotalAmount(
          service,
          bookingDto?.numberOfPeople ?? 1
        ),
        transactionCode: await this.generateUniqueTransactionCode(customer),
        customerId: customer.id,
        price: service.price,
        discount: service.discount,
        serviceCharge: service.serviceCharge,
        currency: bookingDto.currency,
        paymentGateway: bookingDto.paymentGateway,
        paymentMethod: bookingDto.paymentMethod
      };
      const bookingInitiationLog = new BookingInitiationLogEntity();
      const manager = queryRunner.manager;
      bookingInitiationLog.bookingData = booking;
      bookingInitiationLog.transactionData = transaction;
      return await manager.save(bookingInitiationLog);
    } catch (error) {
      throw error;
    }
  }

  async storeBooking(
    bookingInitiateLogData: BookingInitiationLogEntity,
    paymentGatewayResponse: object,
    transactionStatus: TransactionStatusEnum
  ) {
    const { bookingData, transactionData } = bookingInitiateLogData;
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      bookingInitiateLogData.bookingCreated = true;
      await manager.save(BookingInitiationLogEntity, bookingInitiateLogData);
      const whereCondition = {
        id: bookingData.scheduleId,
        date: bookingData.scheduleDate
      };
      const schedule = (await manager.findOne(ScheduleEntity, whereCondition, {
        relations: [
          'service',
          'service.user',
          'service.user.providerInformation',
          'service.user.providerInformation.country'
        ]
      })) as ScheduleEntity;
      const service = schedule.service;
      const scheduleTime = schedule.schedules.find(
        (time) => time.id === bookingData.scheduleTimeId
      );
      if (schedule.service.scheduleType === ScheduleTypeEnum.SPEICIALIST_ONLY) {
        scheduleTime['isBooked'] = true;
      }
      await manager.save(schedule);
      const booking = await manager.save(BookingEntity, bookingData);
      const transaction = new TransactionEntity();
      transaction.booking = booking;
      if (paymentGatewayResponse) {
        manager.merge(
          TransactionEntity,
          transaction,
          {
            response_json: paymentGatewayResponse,
            status: transactionStatus
          },
          transactionData
        );
      }

      await manager.save(transaction);
      await queryRunner.commitTransaction();
      await this.backOfficeQueue.add('back-office', {
        service,
        booking,
        transaction
      });

      return booking;
      //   booking.transactions = [transaction];
      // return bookingResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  handleOmiseEventHook(req: RawBodyRequest<Request>) {
    const omiseService = this.moduleRef.get(OmiseService, {
      strict: false
    });
    return omiseService.handleWebHook(req);
  }
}
