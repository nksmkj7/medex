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
    return this.providerService.createProvider(registerProviderDto);
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
  update(
    @Param('id')
    id: string,
    @Body()
    updateProviderDto: UpdateProviderDto
  ) {
    console.log('updateProviderDto', updateProviderDto);
  }
}
