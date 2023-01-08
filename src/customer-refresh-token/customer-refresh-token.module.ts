import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerRefreshTokenService } from 'src/customer-refresh-token/customer-refresh-token.service';
import { CustomerRefreshTokenRepository } from 'src/customer-refresh-token/customer-refresh-token.repository';
import { CustomerModule } from 'src/customer/customer.module';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    forwardRef(() => CustomerModule),
    TypeOrmModule.forFeature([CustomerRefreshTokenRepository]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || jwtConfig.secret,
        signOptions: {
          expiresIn:
            process.env.JWT_REFRESH_EXPIRES_IN || jwtConfig.refreshExpiresIn
        }
      })
    })
  ],
  providers: [CustomerRefreshTokenService],
  exports: [CustomerRefreshTokenService],
  controllers: []
})
export class CustomerRefreshTokenModule {}
