import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { ProviderSearchFilterDto } from './dto/provider-search-filter.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderService } from './provider.service';

@ApiTags('provider')
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('register')
  async register(
    @Body(ValidationPipe)
    registerProviderDto: RegisterProviderDto
  ) {
    const user = await this.providerService.createProvider(registerProviderDto);
    return user;
  }

  @Get(':id')
  async getProviderDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.providerService.getProviderDetail(id);
  }

  @Get()
  async getProviderList(
    @Query()
    providerSearchFilterDto: ProviderSearchFilterDto
  ) {
    return await this.providerService.getProviderList(providerSearchFilterDto);
  }

  @UseInterceptors(new InjectRequestInterceptor(['params']))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateProviderDto: UpdateProviderDto
  ) {
    return await this.providerService.update(id, updateProviderDto);
    // console.log('updateProviderDto', updateProviderDto);
  }
}
