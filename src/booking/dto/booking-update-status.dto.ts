import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatusEnum } from '../enums/booking-status.enum';

export class BookingUpdateStatusDto {
  @IsNotEmpty()
  //   @IsEnum(BookingStatusEnum)
  status: BookingStatusEnum;
}
