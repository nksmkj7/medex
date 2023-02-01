import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { InjectConnection } from '@nestjs/typeorm';
import axios, { Axios } from 'axios';
import { Job } from 'bull';
import * as config from 'config';
import dayjs = require('dayjs');
import { Connection } from 'typeorm';
import { BackOfficeLogEntity } from './entity/back-office-logs.entity';
import { IBackOfficePayload } from './interface/backoffice-payload.interface';

interface IBookingObj {
  service: { [index: string]: any };
  transaction: { [index: string]: any };
  booking: { [index: string]: any };
}

export interface IBackOfficeResponse {
  headers: { [index: string]: any };
  url: string;
  method: string;
  data: string;
  response: { [index: string]: any };
}

@Processor(config.get('backOffice.queueName'))
export class BackOfficeProcessor {
  // protected backOfficeWebHookEndPoint = `${config.get(
  //   'backOffice.baseUrl'
  // )}/auto_confirmation_webhook`;
  protected backOfficeWebHookEndPoint = `${config.get(
    'backOffice.baseUrl'
  )}/webhook/checkup`;

  constructor(@InjectConnection() protected readonly connection: Connection) {}

  @Process('booking')
  async processBooking(job: Job) {
    const { service, booking, transaction } = job.data;
    const payload = this.getApiPayloads({ service, booking, transaction });
    axios
      .post(this.backOfficeWebHookEndPoint, payload, {
        headers: {
          // Authorization: '494k42j4234ko5j2j6m7j5'
          'Authorization-Secret-Key': config.get('backOffice.secretKey')
        }
      })
      .then((response) => {
        this.storeBackOfficeResponse(response, booking.id, true);
      })
      .catch(async (e) => {
        this.storeBackOfficeResponse(e, booking.id, false);
      });
  }

  getApiPayloads(bookingObj: IBookingObj): IBackOfficePayload {
    const { booking, service, transaction } = bookingObj;
    const {
      country = '',
      state = '',
      city = ''
    } = service?.user?.providerInformation;

    const providerAddress = [city, state, country.name].join(', ');
    return {
      package_title: service.title,
      package_included: [
        service.title,
        service?.shortDescription ?? '',
        `${service.price}`
      ].join('|'),
      provider_name: service?.user?.providerInformation?.companyName ?? '',
      provider_address: providerAddress,
      unit_price: service.amount_after_service_charge,
      open_timing: '',
      prepayment_required: 'NO',
      booking_info: {
        order_id: booking.bookingNumber,
        customer_name: `${booking.firstName} ${booking.lastName}`,
        phone: booking.phone,
        email: booking.email,
        address: '',
        quantity: '1',
        total_price: transaction.totalAmount,
        currency: transaction.currency,
        discount_price: transaction.discount,
        pay_status: transaction.status,
        status: booking.status,
        package_id: '1',
        linked_customer_name: '',
        memo: '',
        test_site: 'C', //C for clinic and H for hospital
        appointment_date: booking.scheduleDate,
        appointment_time: booking.serviceStartTime,
        date_created: dayjs(booking.createdAt).format('YYYY-MM-DD')
      }
    };
  }

  storeBackOfficeResponse(
    backOfficeResponse: { [index: string]: any },
    bookingId: string,
    status: boolean
  ) {
    const responseObj: IBackOfficeResponse | Record<string, unknown> = {};
    let response: any;
    if (axios.isAxiosError(backOfficeResponse)) {
      response = backOfficeResponse.response;
    } else response = backOfficeResponse;
    responseObj['data'] = response.config.data;
    responseObj['url'] = response.config.url;
    responseObj['method'] = response.config.method;
    responseObj['response'] = response.data;
    return this.connection.manager
      .createQueryBuilder(BackOfficeLogEntity, 'backOffice')
      .insert()
      .values({ backOfficeResponse: { ...responseObj }, bookingId, status })
      .execute();
  }
}
