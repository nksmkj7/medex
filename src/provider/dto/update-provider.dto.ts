import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  Allow,
  IsDateString,
  Validate,
  IsEmail,
  IsString
} from 'class-validator';
import { UpdateUserProfileDto } from 'src/auth/dto/update-user-profile.dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';

export class UpdateProviderDto extends OmitType(UpdateUserProfileDto, [
  'email',
  'username'
] as const) {
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
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

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

  @ApiPropertyOptional()
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
