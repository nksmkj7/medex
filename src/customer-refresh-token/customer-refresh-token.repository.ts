import { EntityRepository } from 'typeorm';
import * as config from 'config';

import { CustomerRefreshToken } from 'src/customer-refresh-token/entities/customer-refresh-token.entity';
import { BaseRepository } from 'src/common/repository/base.repository';
import { CustomerRefreshTokenSerializer } from 'src/customer-refresh-token/serializer/customer-refresh-token.serializer';
import { CustomerSerializer } from 'src/customer/serializer/customer.serializer';

const tokenConfig = config.get('jwt');
@EntityRepository(CustomerRefreshToken)
export class CustomerRefreshTokenRepository extends BaseRepository<
  CustomerRefreshToken,
  CustomerRefreshTokenSerializer
> {
  /**
   * Create refresh token
   * @param user
   * @param tokenPayload
   */
  public async createRefreshToken(
    user: CustomerSerializer,
    tokenPayload: Partial<CustomerRefreshToken>
  ): Promise<CustomerRefreshToken> {
    const token = this.create();
    token.customerId = user.id;
    token.isRevoked = false;
    token.ip = tokenPayload.ip;
    token.userAgent = tokenPayload.userAgent;
    token.browser = tokenPayload.browser;
    token.os = tokenPayload.os;
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + tokenConfig.refreshExpiresIn
    );
    token.expires = expiration;
    return token.save();
  }

  /**
   * find token by id
   * @param id
   */
  public async findTokenById(id: number): Promise<CustomerRefreshToken | null> {
    return this.findOne({
      where: {
        id
      }
    });
  }
}
