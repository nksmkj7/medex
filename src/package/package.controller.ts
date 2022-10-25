import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { PackageService } from './package.service';
import { PackageFilterDto } from './dto/package-filter.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageSerializer } from './serializer/package.serializer';

@ApiTags('Package')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/package', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body()
    createPackageDto: CreatePackageDto,
    @UploadedFile()
    file: Express.Multer.File
  ): Promise<PackageSerializer> {
    return this.packageService.create({
      ...createPackageDto,
      image: file.filename
    });
  }

  @Public()
  @Get()
  findAll(
    @Query()
    PackageFilterDto: PackageFilterDto
  ): Promise<Pagination<PackageSerializer>> {
    return this.packageService.findAll(PackageFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number
  ): Promise<PackageSerializer> {
    return this.packageService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/package', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    updatePackageDto: UpdatePackageDto
  ): Promise<PackageSerializer> {
    return this.packageService.update(id, updatePackageDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.packageService.remove(+id);
  }
}
