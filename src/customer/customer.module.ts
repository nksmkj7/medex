import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import * as config from 'config';
import { CustomerRefreshTokenModule } from 'src/customer-refresh-token/customer-refresh-token.module';

const jwtConfig = config.get('jwt');
@Module({
  providers: [CustomerService],
  controllers: [CustomerController],
  imports: [
    TypeOrmModule.forFeature([CustomerRepository]),
    MailModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || jwtConfig.secret,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN || jwtConfig.expiresIn
        }
      })
    }),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    CustomerRefreshTokenModule
  ],
  // exports: [CustomerService]
  exports: [
    CustomerService,
    // JwtTwoFactorStrategy,
    // JwtStrategy,
    PassportModule,
    JwtModule
  ]
})
export class CustomerModule {}
