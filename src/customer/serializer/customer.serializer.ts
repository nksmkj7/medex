import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { UserStatusEnum } from 'src/auth/user-status.enum';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

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
  phoneNumber: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
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
  otp: Date;

  @Exclude({
    toClassOnly: true
  })
  otpSentTime: Date;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
