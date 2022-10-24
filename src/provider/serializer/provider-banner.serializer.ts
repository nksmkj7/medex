import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import * as config from 'config';
const appConfig = config.get('app');

import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { Allow } from 'class-validator';

export const adminUserGroupsForSerializing: string[] = ['admin'];
export const ownerUserGroupsForSerializing: string[] = ['owner'];
export const defaultUserGroupsForSerializing: string[] = ['timestamps'];

/**
 * user serializer
 */
export class ProviderBannerSerializer extends ModelSerializer {
  @ApiProperty()
  @Transform(({ value }) =>
    value ? `${appConfig.appUrl}/images/provider-banners/${value}` : null
  )
  image: string;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  @Exclude({
    toClassOnly: true
  })
  userId: number;

  @ApiProperty()
  @Expose()
  @Type(() => UserSerializer)
  provider: UserSerializer;
}
