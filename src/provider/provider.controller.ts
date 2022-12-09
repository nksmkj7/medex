import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Headers
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags, OmitType } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { ServiceFilterDto } from 'src/service/dto/service-filter.dto';
import { ServiceDto } from 'src/service/dto/service.dto';
import { ObjectLiteral } from 'typeorm';
import { ProviderBannerDto } from './dto/provider-banner.dto';
import { ProviderDayScheduleDto } from './dto/provider-day-schedule.dto';
import { ProviderSearchFilterDto } from './dto/provider-search-filter.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { UpdateProviderBannerDto } from './dto/update-provider-banner.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderService } from './provider.service';

export class ServiceFilterDtoWithoutProvider extends OmitType(
  ServiceFilterDto,
  ['provider']
) {}

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

  @Public()
  @Get('active')
  getActiveProviders() {
    return this.providerService.activeProviders();
  }

  @Get(':id')
  @Public()
  @ApiTags('Public')
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
  @Public()
  @ApiTags('Public')
  getProviderServices(
    @Param('id', ParseIntPipe) id: number,
    @Headers() headers: object,
    @Query() serviceFilterDto: ServiceFilterDtoWithoutProvider
  ) {
    return this.providerService.providerServices(
      id,
      serviceFilterDto,
      headers['referer']
    );
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

  @Post(':id/banners')
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/provider-banners', 1000000, true)
    )
  )
  @ApiConsumes('multipart/form-data')
  storeProviderBanner(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    providerBannerDto: ProviderBannerDto
  ) {
    return this.providerService.saveBanner(id, providerBannerDto, file);
  }

  @Get(':id/banners')
  getProviderBanners(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.providerBanners(id);
  }

  @Delete(':id/banners/:bannerId')
  deleteProviderBanner(
    @Param('id', ParseIntPipe) id: number,
    @Param('bannerId', ParseUUIDPipe) bannerId: string
  ) {
    return this.providerService.removeProviderBanner(id, bannerId);
  }

  @Put(':id/banners/:bannerId')
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/provider-banners', 1000000, true)
    )
  )
  @ApiConsumes('multipart/form-data')
  editProviderBanner(
    @Param('id', ParseIntPipe) id: number,
    @Param('bannerId', ParseUUIDPipe) bannerId: string,
    @UploadedFile()
    file: Express.Multer.File,
    @Body() updateProviderBannerDto: UpdateProviderBannerDto
  ) {
    return this.providerService.updateProviderBanner(
      id,
      bannerId,
      updateProviderBannerDto,
      file
    );
  }

  @Get(':id/banners/:bannerId')
  getBannerDetail(
    @Param('id', ParseIntPipe) id: number,
    @Param('bannerId', ParseUUIDPipe) bannerId: string
  ) {
    return this.providerService.getProviderBanner(id, bannerId);
  }

  @Public()
  @ApiTags('Public')
  @Get(':providerId/banners-list')
  activeProviderBanners(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providerService.providerBanners(providerId, { status: true });
  }
}
