import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerRefreshTokenService } from 'src/customer-refresh-token/customer-refresh-token.service';
import { CustomerRefreshTokenRepository } from 'src/customer-refresh-token/customer-refresh-token.repository';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [
    forwardRef(() => CustomerModule),
    TypeOrmModule.forFeature([CustomerRefreshTokenRepository])
  ],
  providers: [CustomerRefreshTokenService],
  exports: [CustomerRefreshTokenService],
  controllers: []
})
export class CustomerRefreshTokenModule {}
