import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CustomerSignupDto } from './dto/customer-signup.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}
  @Post('/register')
  register(@Body() customerSignupDto: CustomerSignupDto) {
    return this.service.store(customerSignupDto);
  }

  @Get('/activate-account')
  activateAccount(@Query('token') token: string) {
    return this.service.activateAccount(token);
  }
}
