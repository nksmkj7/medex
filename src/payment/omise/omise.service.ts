import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as Omise from 'omise';
import { BookingDto } from 'src/booking/dto/booking.dto';
import { PaymentMethodEnum } from 'src/booking/enums/payment-method.enum';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { PaymentAbstract } from '../payment.abstract';

import * as config from 'config';
import { BookingEntity } from 'src/booking/entity/booking.entity';
const appConfig = config.get('app');

@Injectable()
export class OmiseService extends PaymentAbstract<Omise.Charges.ICharge> {
  constructor(@Inject('OMISE_CLIENT') private omise: Omise.IOmise) {
    super();
  }

  async pay(
    bookingDto: BookingDto,
    customer: CustomerEntity,
    service: ServiceEntity
  ) {
    try {
      const response = await this.verify(customer, bookingDto, service);
      return response;
    } catch (error) {
      throw error;
    }

    return this.verifyOtherPayment(customer, bookingDto, service);
  }

  verify(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    this.checkPaymentValidity(bookingDto, service);
    if (bookingDto.paymentMethod === PaymentMethodEnum.CARD) {
      return this.verifyOmiseCardPayment(customer, bookingDto, service);
    }
    return this.verifyOtherPayment(customer, bookingDto, service);
  }

  async verifyOmiseCardPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const omiseCustomer = await this.omise.customers.create({
      email: customer.email,
      card: bookingDto.token
    });
    return this.omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      currency: bookingDto.currency,
      customer: omiseCustomer.id
    });
  }

  async verifyOtherPayment(
    customer: CustomerEntity,
    bookingDto: BookingDto,
    service: ServiceEntity
  ) {
    const { currency, token } = bookingDto;

    return this.omise.charges.create({
      amount: this.calculateServiceTotalAmount(service) * 100,
      source: token,
      currency,
      return_uri: `${appConfig.frontendUrl}/booking`
    });
  }

  checkPaymentValidity(bookingDto: BookingDto, service: ServiceEntity) {
    if (
      Number(bookingDto.totalAmount) !==
      Number(this.calculateServiceTotalAmount(service))
    ) {
      throw new BadRequestException(
        'Sent amount is not matched with the system calculated amount '
      );
    }
    return true;
  }
}
