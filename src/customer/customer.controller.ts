import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CustomerRefreshToken } from 'src/customer-refresh-token/entities/customer-refresh-token.entity';
import UAParser = require('ua-parser-js');
import { CustomerService } from './customer.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { Request } from 'express';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { CustomerJwtAuthGuard } from 'src/common/guard/customer-jwt-auth.guard';
import { GetCustomer } from 'src/common/decorators/get-customer.decorator';
import { CustomerSerializer } from './serializer/customer.serializer';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { CustomerEntity } from './entity/customer.entity';
import { CustomerProfileImageDto } from './dto/profile-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}
  @Post('/register')
  register(@Body() customerSignupDto: CustomerSignupDto) {
    return this.service.store(customerSignupDto);
  }

  @Post('/activate-account')
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

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get('/profile')
  profile(
    @GetCustomer()
    customer: CustomerEntity
  ) {
    return this.service.getProfile(customer);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Put('/change-password')
  changePassword(
    @GetCustomer()
    customer: CustomerEntity,
    @Body()
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.service.changePassword(customer, changePasswordDto);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'customer profile image',
    type: CustomerProfileImageDto
  })
  @UseInterceptors(
    FileInterceptor(
      'profilePicture',
      multerOptionsHelper('public/images/customer-profile', 1000000, true)
    )
  )
  @Post('/profile-image')
  updateProfileImage(
    @GetCustomer()
    customer: CustomerEntity,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Profile image is required.');
    }
    return this.service.uploadProfileImage(file, customer);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Put('/profile')
  updateProfile(
    @GetCustomer()
    customer: CustomerEntity,
    @Body()
    updateProfileDto: UpdateProfileDto
  ) {
    return this.service.updateProfile(updateProfileDto, customer);
  }
}
