import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { RoleSerializer } from 'src/role/serializer/role.serializer';
import { UserSerializer } from 'src/auth/serializer/user.serializer';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['timestamps'];

/**
 * user serializer
 */
export class ProviderSerializer extends ModelSerializer {
  @ApiProperty()
  companyName: string;

  @ApiProperty()
  phone1: string;

  @ApiProperty()
  @Exclude()
  phone2: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  @Expose({
    toClassOnly: true
  })
  countryId: number;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  landmark: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  contactPerson: string;

  @ApiProperty()
  serviceArea: string;

  @ApiProperty()
  businessLocation: string;

  @ApiProperty()
  businessLogo: string;

  @ApiProperty()
  businessDescription: string;

  @ApiProperty()
  vatNo: string;

  @ApiProperty()
  termsCondition: string;

  @ApiHideProperty()
  @Type(() => UserSerializer)
  user: UserSerializer;
}
