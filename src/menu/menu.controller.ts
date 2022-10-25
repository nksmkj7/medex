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
  Headers
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
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

  @Post()
  create(
    @Body()
    createMenuDto: CreateMenuDto
  ) {
    return this.menuService.create(createMenuDto);
  }

  @Public()
  @ApiTags('Public')
  @Get()
  findAll(
    @Query()
    menuFilterDto: MenuFilterDto,
    @Headers('referer') referer: string
  ): Promise<Pagination<MenuSerializer>> {
    return this.menuService.findAll(menuFilterDto, referer);
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
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateMenuDto: UpdateMenuDto
  ) {
    return this.menuService.update(id, updateMenuDto);
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
