import { BookingStatusEnum } from "../enums/booking-status.enum";
import { PaymentMethodEnum } from "../enums/payment-method.enum";
import { TransactionStatusEnum } from "../enums/transaction-status.enum";

export interface IBackOfficePayload { 
    id: string | number,
    status: BookingStatusEnum,
    currency: string,
    date_created: Date,
    total: number,
    billing: {
        first_name: string,
        last_name?: string,
        company?: string,
        address_1: string,
        email: string,
        phone: string
    },
    payment_method: PaymentMethodEnum,
    customer_note: string,
    customer_id: string,
    date_paid: Date,
    line_items: [
        {
            id: number,
            name: string,
            total: string,
            price: number
        }
    ],
    payment_status: TransactionStatusEnum,
    env: string
}