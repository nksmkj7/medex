import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Headers
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { FileInterceptor } from '@nestjs/platform-express';

import { CategoryService } from './category.service';
import {
  CategoryFilterDto,
  SubCategoryFilterDto
} from './dto/category-filter.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategorySerializer } from './serializer/category.serializer';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Category')
@Controller('category')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/category', 1000000)
    )
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body()
    createCategoryDto: CreateCategoryDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.categoryService.create({
      ...createCategoryDto,
      image: file?.filename ?? null
    });
  }

  @Public()
  @Get()
  findAll(
    @Query()
    categoryFilterDto: CategoryFilterDto,
    @Headers() headers: object
  ): Promise<Pagination<CategorySerializer>> {
    return this.categoryService.findAll(categoryFilterDto, headers['referer']);
  }

  @Get('active')
  getActiveCategories() {
    return this.categoryService.activeCategories();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe)
    id: string
  ): Promise<CategorySerializer> {
    return this.categoryService.findOne(id);
  }

  @ApiConsumes('multipart/form-data')
  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor(
      'image',
      multerOptionsHelper('public/images/category', 1000000)
    )
  )
  update(
    @Param('id', ParseUUIDPipe)
    id: string,
    @Body()
    updateCategoryDto: UpdateCategoryDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.categoryService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.categoryService.remove(id);
  }

  @Get(':id/sub-categories')
  getSubCategories(
    @Param('id', ParseUUIDPipe) id: string,
    @Query()
    categoryFilterDto: SubCategoryFilterDto
  ) {
    return this.categoryService.subCategories(id, categoryFilterDto);
  }
}
