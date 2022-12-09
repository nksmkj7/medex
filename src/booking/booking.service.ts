import {
  BadRequestException,
  Injectable,
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
import {
  adminUserGroupsForSerializing,
  basicFieldGroupsForSerializing
} from './serializer/booking.serializer';
import * as Omise from 'omise';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentGatewayException } from 'src/exception/payment-gateway.exception';
import { TransactionStatusEnum } from './enums/transaction-status.enum';
import { PaymentMethodEnum } from './enums/payment-method.enum';
import * as config from 'config';
import { paginate } from 'src/common/helper/pagination.helper';
import { CustomerBookingFilterDto } from './dto/customer-booking-filter.dto';

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
      let paymentResponse = {};
      if (
        Number(bookingDto.totalAmount) !==
        Number(this.calculateServiceTotalAmount(service))
      ) {
        throw new BadRequestException(
          'Sent amount is not matched with the system calculated amount '
        );
      }
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
      transaction.paymentMethod = bookingDto.paymentMethod;
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

    if (bookingDto.paymentMethod === PaymentMethodEnum.CARD) {
      return this.verifyOmiseCardPayment(omise, customer, bookingDto, service);
    }
    return this.verifyOtherPayment(omise, customer, bookingDto, service);
  }

  async verifyOmiseCardPayment(
    omise: Omise.IOmise,
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const omiseCustomer = await omise.customers.create({
      email: customer.email,
      card: bookingDto.token
    });
    return omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency: bookingDto.currency,
      customer: omiseCustomer.id
    });
  }

  async verifyOtherPayment(
    omise: Omise.IOmise,
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const { currency, token } = bookingDto;

    return omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      source: token,
      currency,
      return_uri: `${appConfig.frontendUrl}/booking`
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
      WHERE "booking"."customerId" =$2 limit $3 offset $4`,
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
      ['customer', 'transactions', 'schedule', 'schedule.service'],
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
}
