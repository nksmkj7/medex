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
  UseGuards,
  UseInterceptors,
  Headers,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenuFilterDto, SubMenuFilterDto } from './dto/menu-filter.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuService } from './menu.service';
import { MenuSerializer } from './serializer/menu.serializer';

@ApiTags('Menu')
@Controller('menu')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseInterceptors(
    FileInterceptor('icon', multerOptionsHelper('public/images/menu', 1000000))
  )
  @Post()
  @ApiConsumes('multipart/form-data')
  create(
    @Body()
    createMenuDto: CreateMenuDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.menuService.create(createMenuDto, file);
  }

  @Public()
  @ApiTags('Public')
  @Get()
  findAll(
    @Query()
    menuFilterDto: MenuFilterDto,
    @Headers() headers: object
  ): Promise<Pagination<MenuSerializer>> {
    return this.menuService.findAll(menuFilterDto, headers['referer']);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number
  ): Promise<MenuSerializer> {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @UseInterceptors(
    FileInterceptor('icon', multerOptionsHelper('public/images/menu', 1000000))
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateMenuDto: UpdateMenuDto,
    @UploadedFile()
    file: Express.Multer.File
  ) {
    return this.menuService.update(id, updateMenuDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.menuService.remove(+id);
  }

  @Get(':id/sub-menus')
  getSubCategories(
    @Param('id', ParseIntPipe) id: number,
    @Query()
    menuFilterDto: SubMenuFilterDto
  ) {
    return this.menuService.subMenus(id, menuFilterDto);
  }
}
