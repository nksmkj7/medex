import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterProviderDto } from './dto/register-provider.dto';
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
    this.providerService.registerProvider(registerProviderDto);
  }
}
