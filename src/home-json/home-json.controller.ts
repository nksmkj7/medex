import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { HomeJsonSearchDto } from './dto/home-json-search.dto';
import { HomeJsonDto } from './dto/home-json.dto';
import { UpdateHomeJsonDto } from './dto/update-home-json.dto';
import { HomeJsonService } from './home-json.service';

@ApiTags('Home Json')
@Controller('home-json')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class HomeJsonController {
  constructor(private readonly service: HomeJsonService) {}

  @ApiOperation({
    summary: 'add home json section'
  })
  @Post()
  storeHomeJson(@Body() homeJsonDto: HomeJsonDto) {
    return this.service.storeHomeJson(homeJsonDto);
  }

  @ApiOperation({
    summary: 'get all home json sections',
    tags: ['Public']
  })
  @Public()
  @Get('/list')
  findAll(@Query() homeJsonSearchDto: HomeJsonSearchDto) {
    return this.service.findAll(homeJsonSearchDto);
  }

  @ApiOperation({
    summary: 'get home json detail by id'
  })
  @Get('/:id')
  find(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @ApiOperation({
    summary: 'Update home json data by id'
  })
  @Put('/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHomeJsonDto: UpdateHomeJsonDto
  ) {
    return this.service.update(id, updateHomeJsonDto);
  }

  @Public()
  @Get()
  @ApiTags('Public')
  @ApiOperation({
    summary: 'get home json api for specific country'
  })
  getHomeJson(@Query('countryId', ParseIntPipe) countryId: number) {
    return this.service.getHomeJson(countryId);
  }

  @ApiOperation({
    summary: 'Delete home json section by id'
  })
  @Delete('/:id')
  removeHomeJsonSection(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
