import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { HomeJsonDto } from './dto/home-json.dto';
import { HomeJsonService } from './home-json.service';

@ApiTags('Home Json')
@Controller('home-json')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class HomeJsonController {
  constructor(private readonly service: HomeJsonService) {}

  @Post()
  storeHomeJson(@Body() homeJsonDto: HomeJsonDto) {
    return this.service.storeHomeJson(homeJsonDto);
  }

  @Public()
  @Get()
  @ApiTags('Public')
  getHomeJson() {
    return this.service.getHomeJson();
  }
}
