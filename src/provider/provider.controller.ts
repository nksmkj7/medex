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
import { Transform } from 'class-transformer';
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

  @Post('register')
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
      businessLogo: file.filename
    });
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
    updateProviderDto = file
      ? { ...updateProviderDto, businessLogo: file.filename }
      : updateProviderDto;

    return await this.providerService.update(id, updateProviderDto);
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

  @Get(':id/specialists')
  getProviderCategories(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.providerCategories(id);
  }
}
