import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { StaticPageService } from './static-page.service';

@Controller('static-page')
@ApiTags('Static Page')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class StaticPageController {
  constructor(protected readonly service: StaticPageService) {}

  @Get()
  staticPages() {
    return this.service.getStaticPageList();
  }

  @Public()
  @ApiTags('Public')
  @Get(':slug')
  staticPage(@Param('slug') slug: string) {
    return this.service.getStaticPageBySlug(slug);
  }

  @Put(':id')
  updateStaticPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaticPageDto: UpdateStaticPageDto
  ) {
    return this.service.updateStaticPage(id, updateStaticPageDto);
  }

  @Delete(':id')
  deleteStaticPage(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteStaticPage(id);
  }
}
