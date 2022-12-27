import { OnQueueActive, Process, Processor } from "@nestjs/bull";
import { InjectConnection } from "@nestjs/typeorm";
import axios, { Axios } from "axios";
import { Job } from "bull";
import * as config from 'config';
import { Connection } from "typeorm";
import { BackOfficeLogEntity } from "./entity/back-office-logs.entity";
import { IBackOfficePayload } from "./interface/backoffice-payload.interface";


interface IBookingObj {
  service: { [index: string]: any },
  transaction: { [index:string]:any}  
  booking: { [index:string]:any}

}

export interface IBackOfficeResponse { 
  headers: { [index: string]: any },
  url: string,
  method: string,
  data: string,
  response: {[index:string]:any}

}

@Processor(config.get('backOffice.queueName'))
export class BackOfficeProcessor { 
  protected backOfficeWebHookEndPoint = `${config.get('backOffice.baseUrl')}/auto_confirmation_webhook`
  constructor(
    @InjectConnection() protected readonly connection: Connection
  ) { }

  @Process('booking')
  async processBooking(job: Job) { 
    const { service,booking,transaction} = job.data
    const payload = this.getApiPayloads({ service, booking, transaction })
    axios.post(this.backOfficeWebHookEndPoint, payload, {
      headers: {
        Authorization:"494k42j4234ko5j2j6m7j5",
      }
    })
      .then(response => { 
        console.log(response,'response is --->')
      })
      .catch(async e => { 
         this.storeBackOfficeResponse(e,booking.id,false)
      })
  }

  getBackOfficeWebHookLineItems(bookingObj:IBookingObj) { }


  getApiPayloads(bookingObj:IBookingObj):IBackOfficePayload {
    const { booking,service,transaction} = bookingObj
    return {
      id: booking.id,
      status: booking.status,
      currency: transaction.currency,
      date_created: booking.createdAt,
      total: transaction.totalAmount,
      billing: {
        first_name: booking.firstName,
        last_name: booking.lastName,
        company: "",
        address_1: "",
        email: booking.email,
        phone: booking.phone
      },
      payment_method: transaction.paymentGateway,
      customer_note: "",
      customer_id: booking.customerId,
      date_paid: transaction.createdAt,
      line_items: [
          {
              id: service.id,
              name: service.title,
              total: transaction.totalAmount,
              price: transaction.price
          }
      ],
      payment_status: transaction.status,
      env: "dev"
    }
  }

  storeBackOfficeResponse(backOfficeResponse: { [index:string]:any},bookingId: string,status:boolean) { 
    let responseObj: IBackOfficeResponse | {} = {};
    if (axios.isAxiosError(backOfficeResponse)) { 
      responseObj['data'] = backOfficeResponse.response.config.data
      responseObj['url'] = backOfficeResponse.response.config.url
      responseObj['method'] = backOfficeResponse.response.config.method
      responseObj['response'] = backOfficeResponse.response.data

    }
    return this.connection.manager
      .createQueryBuilder(BackOfficeLogEntity, 'backOffice')
      .insert()
      .values({backOfficeResponse:{...responseObj},bookingId,status})
      .execute()
  }

}