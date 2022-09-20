import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { CustomerController } from './customer.controller';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';

@Module({
  providers: [CustomerService],
  controllers: [CustomerController],
  imports: [TypeOrmModule.forFeature([CustomerRepository]), MailModule]
})
export class CustomerModule {}
