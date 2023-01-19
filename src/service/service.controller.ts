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
  UseInterceptors,
  Headers,
  UploadedFile,
  UploadedFiles
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor
} from '@nestjs/platform-express/multer';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { SpecialistFilterDto } from 'src/specialist/dto/specialist-filter.dto';
import { AssignSpecialistDto } from './dto/assign-specialist.dto';
import { CategoryProviderServiceDto } from './dto/category-provider-service.dto';
import { SearchCategoryProvideServiceDto } from './dto/search-category-provider-service.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateAssignSpecialistDto } from './dto/update-assign-specialist.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceSerializer } from './service.serializer';
import { ServiceService } from './service.service';

@ApiTags('service')
@Controller('service')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Post()
  // @UseInterceptors(
  //   FileInterceptor(
  //     'image',
  //     multerOptionsHelper('public/images/service', 1000000)
  //   )
  // )
  // @ApiMultiFile()
  @UseInterceptors(
    FilesInterceptor(
      'image',
      null,
      multerOptionsHelper('public/images/service', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body() serviceDto: ServiceDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.service.create(serviceDto, files);
  }

  @Public()
  @ApiTags('Public')
  @Get()
  findAll(
    @Query()
    serviceFilterDto: ServiceFilterDto,
    @Headers() headers: object
  ): Promise<Pagination<ServiceSerializer>> {
    return this.service.findAll(serviceFilterDto, headers['referer']);
  }

  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/service', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile()
    file: Express.Multer.File
  ): Promise<ServiceSerializer> {
    return this.service.update(id, updateServiceDto, file);
  }

  @ApiTags('Public')
  @Public()
  @Get('category-provider')
  getProviderServiceByCategoryId(
    @Query() categoryProviderServiceDto: CategoryProviderServiceDto
  ) {
    return this.service.getProviderService(categoryProviderServiceDto);
  }

  @ApiTags('Public')
  @Public()
  @Get('search-category')
  searchProviderService(
    @Query() searchCategoryProvideServiceDto: SearchCategoryProvideServiceDto
  ) {
    return this.service.searchProviderService(searchCategoryProvideServiceDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceSerializer> {
    return this.service.findOne(id);
  }

  @Public()
  @ApiTags('Public')
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
  assignServiceSpecialist(
    @Body() assignSpecialistDto: AssignSpecialistDto,
    @Param('serviceId', ParseUUIDPipe) serviceId: string
  ) {
    return this.service.assignServiceSpecialist(serviceId, assignSpecialistDto);
  }

  @Put(':serviceId/assign-specialist/:specialistId')
  updateSpecialistService(
    @Param('serviceId', ParseUUIDPipe)
    serviceId: string,
    @Param('specialistId', ParseUUIDPipe)
    specialistId: string,
    @Body() updateAssignSpecialistDto: UpdateAssignSpecialistDto
  ) {
    return this.service.updateSpecialistService(
      serviceId,
      specialistId,
      updateAssignSpecialistDto
    );
  }
}
