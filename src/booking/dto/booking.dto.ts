import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Validate,
  ValidateIf
} from 'class-validator';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { ScheduleEntity } from 'src/schedule/entity/schedule.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { BookingStatusEnum } from '../enums/booking-status.enum';
import { PaymentGatewayEnum } from '../enums/payment-gateway.enum';

export class BookingDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [ScheduleEntity])
  scheduleId: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [ServiceEntity])
  serviceId: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [SpecialistEntity])
  specialistId: string;

  @IsNotEmpty()
  @IsDateString()
  scheduleDate: string;

  @IsNotEmpty()
  @IsUUID('4')
  scheduleTimeId: string;

  @IsNotEmpty()
  @IsNumberString()
  totalAmount: number;

  // @IsNotEmpty()
  // @IsEnum(PaymentGatewayEnum)
  @IsOptional()
  @ValidateIf((object, value) => !!value)
  paymentGateway: string | null;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  //   @IsNotEmpty()
  //   @IsEnum(BookingStatusEnum)
  //   status: BookingStatusEnum;
}
