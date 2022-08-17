import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import * as config from 'config';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const basicFieldGroupsForSerializing: string[] = ['basic'];
const appConfig = config.get('app');

export class SpecialistSerializer extends ModelSerializer {
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  contactNo: number;

  @ApiProperty()
  @Transform(({ value }) => `${appConfig.appUrl}/images/specialist/${value}`)
  image: string;

  @ApiPropertyOptional()
  primarySpecialty: string;

  @ApiPropertyOptional()
  educationTraining: string;

  @ApiPropertyOptional()
  experienceExpertise: string;

  @ApiPropertyOptional()
  publicAwards: string;

  @ApiPropertyOptional()
  membershipActivities: string;

  @ApiProperty()
  licenseRegistrationNumber: string;

  @ApiPropertyOptional()
  licenseCountry: number;

  @ApiProperty({
    name: 'status',
    enum: [true, false],
    enumName: 'status'
  })
  status: boolean;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  updatedAt: Date;
}
