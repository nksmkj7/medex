import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { SpecialistFilterDto } from 'src/specialist/dto/specialist-filter.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceSerializer } from './service.serializer';
import { ServiceService } from './service.service';

@ApiTags('service')
@Controller('service')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  create(@Body() serviceDto: ServiceDto) {
    return this.service.create(serviceDto);
  }

  @Get()
  findAll(
    @Query()
    serviceFilterDto: ServiceFilterDto
  ): Promise<Pagination<ServiceSerializer>> {
    return this.service.findAll(serviceFilterDto);
  }

  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ): Promise<ServiceSerializer> {
    return this.service.update(id, updateServiceDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceSerializer> {
    return this.service.findOne(id);
  }

  @Get(':id/specialists')
  findServiceSpecialists(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() specialistFilterDto: SpecialistFilterDto
  ) {
    return this.service.findServiceSpecialists(id, specialistFilterDto);
  }

  @Get(':serviceId/specialist-service/:specialistId')
  getSpecialistServiceDetail(
    @Param('serviceId', ParseUUIDPipe)
    serviceId: string,
    @Param('specialistId', ParseUUIDPipe)
    specialistId: string
  ) {
    return this.service.getSpecialistService(serviceId, specialistId);
  }

  @Post(':serviceId/assign-specialist')
  assignServiceSpecialist() {}
}
