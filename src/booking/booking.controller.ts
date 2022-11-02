import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCustomer } from 'src/common/decorators/get-customer.decorator';
import { CustomerJwtAuthGuard } from 'src/common/guard/customer-jwt-auth.guard';
import { CustomerEntity } from 'src/customer/entity/customer.entity';
import { BookingService } from './booking.service';
import { BookingDto } from './dto/booking.dto';

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
  customerBooking(@GetCustomer() customer: CustomerEntity) {
    return this.service.getCustomerBooking(customer);
  }
}
