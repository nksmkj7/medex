import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { ObjectLiteral } from 'typeorm';
import { ProviderDayScheduleDto } from './dto/provider-day-schedule.dto';
import { ProviderSearchFilterDto } from './dto/provider-search-filter.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderService } from './provider.service';

@ApiTags('provider')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('register')
  async register(
    @Body(ValidationPipe)
    registerProviderDto: RegisterProviderDto
  ) {
    const user = await this.providerService.createProvider(registerProviderDto);
    return user;
  }

  @Get(':id')
  async getProviderDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.providerService.getProviderDetail(id);
  }

  @Get()
  getProviderList(
    @Query()
    providerSearchFilterDto: ProviderSearchFilterDto
  ) {
    return this.providerService.getProviderList(providerSearchFilterDto);
  }

  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateProviderDto: UpdateProviderDto
  ) {
    return await this.providerService.update(id, updateProviderDto);
  }

  @Post(':id/day-schedules')
  async addDaySchedule(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    providerDayScheduleDto: ProviderDayScheduleDto
  ) {
    console.log(providerDayScheduleDto, '----->');
    // return await this.providerService.addDaySchedule(
    //   id,
    //   providerDayScheduleDto
    // );
  }
}
