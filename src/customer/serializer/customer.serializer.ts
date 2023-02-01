import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { UserStatusEnum } from 'src/auth/user-status.enum';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

import * as config from 'config';
const appConfig = config.get('app');

export class CustomerSerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  address: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  dialCode: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  phoneNumber: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  @Transform(
    ({ value }) =>
      value && `${appConfig.appUrl}/images/customer-profile/${value}`
  )
  profilePicture: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  postCode: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  area: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  city: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  gender: GenderEnum;

  @ApiPropertyOptional()
  status: UserStatusEnum;

  @Exclude({
    toClassOnly: true
  })
  token: Date;

  @Exclude({
    toClassOnly: true
  })
  tokenValidityDate: Date;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
