import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { SpecialistService } from './specialist.service';
// import { BannerFilterDto } from './dto/specialist-filter.dto';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { SpecialistSerializer } from './serializer/specialist.serializer';
import { SpecialistFilterDto } from './dto/specialist-filter.dto';

@ApiTags('Specialist')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('specialist')
export class SpecialistController {
  constructor(private readonly specialistService: SpecialistService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/specialist', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body()
    createSpecialistDto: CreateSpecialistDto,
    @UploadedFile()
    file: Express.Multer.File
  ): Promise<SpecialistSerializer> {
    return this.specialistService.create({
      ...createSpecialistDto,
      image: file ? file.filename : null
    });
  }

  @Get()
  findAll(
    @Query()
    specialistFilterDto: SpecialistFilterDto
  ): Promise<Pagination<SpecialistSerializer>> {
    return this.specialistService.findAll(specialistFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string
  ): Promise<SpecialistSerializer> {
    return this.specialistService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/specialist', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id', ParseUUIDPipe)
    id: string,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    updateSpecialistDto: UpdateSpecialistDto
  ): Promise<SpecialistSerializer> {
    updateSpecialistDto = file
      ? { ...updateSpecialistDto, image: file.filename }
      : { ...updateSpecialistDto };
    return this.specialistService.update(id, updateSpecialistDto);
  }
}
