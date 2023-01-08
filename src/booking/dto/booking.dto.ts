import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  isPhoneNumber,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Validate,
  ValidateIf
} from 'class-validator';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { ScheduleEntity } from 'src/schedule/entity/schedule.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { BookingStatusEnum } from '../enums/booking-status.enum';
import { PaymentGatewayEnum } from '../enums/payment-gateway.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class BookingDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ValidateIf((object) => !!object.phone)
  @IsNotEmpty()
  @IsString()
  dialCode: string;

  @ValidateIf((object, value) => !!value)
  @Validate(
    RunValidation,
    [
      (dialCode: string, value: string) => isPhoneNumber(`${dialCode}${value}`),
      'dialCode'
    ],
    {
      message: 'invalid phone number'
    }
  )
  phone: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [ScheduleEntity])
  scheduleId: string;

  @IsNotEmpty()
  @IsUUID(4)
  @Validate(IsValidForeignKey, [ServiceEntity])
  serviceId: string;

  @ValidateIf((object, value) => !!value)
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

  @IsNotEmpty()
  @IsEnum(PaymentGatewayEnum)
  paymentGateway: PaymentGatewayEnum;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  //   @IsNotEmpty()
  //   @IsEnum(BookingStatusEnum)
  //   status: BookingStatusEnum;

  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;
}
