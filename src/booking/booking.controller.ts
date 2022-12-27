import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCustomer } from 'src/common/decorators/get-customer.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from 'src/common/guard/customer-jwt-auth.guard';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { BookingService } from './booking.service';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { BookingUpdateStatusDto } from './dto/booking-update-status.dto';
import { BookingDto } from './dto/booking.dto';
import { CustomerBookingFilterDto } from './dto/customer-booking-filter.dto';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  bookSchedule(
    @GetCustomer() customer: CustomerEntity,
    @Body() bookingDto: BookingDto
  ) {
    return this.service.storeBooking(bookingDto, customer);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get('/my-bookings')
  customerBooking(
    @GetCustomer() customer: CustomerEntity,
    @Query() customerBookingFilterDto: CustomerBookingFilterDto
  ) {
    return this.service.getCustomerBooking(customer, customerBookingFilterDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  customerBookings(@Query() bookingFilterDto: BookingFilterDto) {
    return this.service.findAll(bookingFilterDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  customerBookingDetail(@Param('id', ParseUUIDPipe) bookingId: string) {
    return this.service.bookingById(bookingId);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Put(':id')
  updateBookingStatus(
    @Param('id', ParseUUIDPipe) bookingId: string,
    @Body() bookingUpdateStatusDto: BookingUpdateStatusDto
  ) {
    return this.service.updateBookingStatus(bookingId, bookingUpdateStatusDto);
  }

  
}
