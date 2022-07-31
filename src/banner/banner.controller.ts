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
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserAvatarDto } from 'src/auth/dto/user-avatar.dto';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { BannerService } from './banner.service';
import { BannerFilterDto } from './dto/banner-filter.dto';
import { CreateBannerDto } from './dto/create-bannter.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerSerializer } from './serializer/banner.serializer';

@ApiTags('Banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/banner', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body()
    createBannerDto: CreateBannerDto,
    @UploadedFile()
    file: Express.Multer.File
  ): Promise<BannerSerializer> {
    return this.bannerService.create({
      ...createBannerDto,
      image: file.filename
    });
  }

  @Get()
  findAll(
    @Query()
    BannerFilterDto: BannerFilterDto
  ): Promise<Pagination<BannerSerializer>> {
    return this.bannerService.findAll(BannerFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number
  ): Promise<BannerSerializer> {
    return this.bannerService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/banner', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    updateRoleDto: UpdateBannerDto
  ): Promise<BannerSerializer> {
    updateRoleDto = file
      ? { ...updateRoleDto, image: file.filename }
      : { ...updateRoleDto };
    return this.bannerService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.bannerService.remove(+id);
  }
}
