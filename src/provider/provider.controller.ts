import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
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

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'businessLogo',
      multerOptionsHelper('public/images/logos', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  async register(
    @Body(ValidationPipe)
    registerProviderDto: RegisterProviderDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    const user = await this.providerService.createProvider({
      ...registerProviderDto,
      businessLogo: file ? file.filename : null
    });
    return user;
  }

  @Get('active')
  getActiveProviders() {
    return this.providerService.activeProviders();
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

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @Put(':id')
  @UseInterceptors(
    FileInterceptor(
      'businessLogo',
      multerOptionsHelper('public/images/logos', 1000000)
    )
  )
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateProviderDto: UpdateProviderDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return await this.providerService.update(id, updateProviderDto, file);
  }

  @Post(':id/day-schedules')
  async addDaySchedule(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    providerDayScheduleDto: ProviderDayScheduleDto
  ) {
    return await this.providerService.addDaySchedule(
      id,
      providerDayScheduleDto
    );
  }

  @Get(':id/day-schedules')
  getDaySchedule(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.getDaySchedule(id);
  }

  @Get(':id/services')
  getProviderCategories(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.providerCategories(id);
  }

  @Get(':id/week-holidays')
  getProviderWeekHolidays(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.providerWeekHolidays(id);
  }

  @Get(':id/day-start-end-time')
  getSpecificDayTime(
    @Param('id', ParseIntPipe) id: number,
    @Query('day') day: string
  ) {
    return this.providerService.dayStartEndTime(id, day);
  }

  // @Post(':id/banners')
  // storeProviderBanners(@Param(id)) {}
}
