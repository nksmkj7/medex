import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomerRefreshToken } from 'src/customer-refresh-token/entities/customer-refresh-token.entity';
import UAParser = require('ua-parser-js');
import { CustomerService } from './customer.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { Request, Response } from 'express';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

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

  @Post('/login')
  async login(
    @Body() customerLoginDto: CustomerLoginDto,
    @Req()
    req: Request
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<CustomerRefreshToken> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name
    };
    const response = await this.service.login(
      customerLoginDto,
      refreshTokenPayload
    );
    return response;
  }

  @Put('/forgot-password')
  forgotPassword(
    @Body()
    forgetPasswordDto: ForgetPasswordDto
  ) {
    return this.service.forgotPassword(forgetPasswordDto);
  }

  @Put('/reset-password')
  resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    return this.service.resetPassword(resetPasswordDto);
  }
}
