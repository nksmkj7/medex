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
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { Pagination } from 'src/paginate';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenuFilterDto } from './dto/menu-filter.dto';
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

  @Get()
  findAll(
    @Query()
    menuFilterDto: MenuFilterDto
  ): Promise<Pagination<MenuSerializer>> {
    return this.menuService.findAll(menuFilterDto);
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
}
