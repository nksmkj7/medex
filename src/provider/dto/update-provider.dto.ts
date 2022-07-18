import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDate,
  IsInt,
  Allow,
  IsDateString,
  Validate
} from 'class-validator';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
// import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

export class UpdateProviderDto {
  @Validate(
    UniqueValidatorPipe,
    [
      UserEntity,
      'email',
      'id',
      {
        roleId: 41
      }
    ],
    {
      message: 'already taken'
    }
  )
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'minLength-{"ln":6,"count":6}'
  })
  @MaxLength(20, {
    message: 'maxLength-{"ln":20,"count":20}'
  })
  companyName: string;

  @IsNotEmpty()
  phone1: string;

  @Allow()
  phone2: string;

  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsInt()
  countryId: number;

  @Allow()
  city?: string;

  @Allow()
  state?: string;

  @Allow()
  landmark?: string;

  @Allow()
  timezone?: string;

  @Allow()
  currency?: string;

  @Allow()
  contactPerson?: string;

  @Allow()
  serviceArea?: string;

  @Allow()
  businessLocation?: string;

  @Allow()
  businessLogo?: string;

  @Allow()
  businessDescription?: string;

  @Allow()
  vatNo?: string;

  @Allow()
  termsCondition?: string;
}
