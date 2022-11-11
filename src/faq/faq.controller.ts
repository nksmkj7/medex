import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Headers,
  Body,
  ParseUUIDPipe,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { InjectRequestInterceptor } from 'src/common/interceptors/inject-request.interceptor';
import { FaqFilterDto } from './dto/faq-filter.dto';
import { FaqDto } from './dto/faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqService } from './faq.service';

@Controller('faq')
@ApiTags('Faq Page')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get()
  @Public()
  @ApiTags('Public')
  getFaqs(
    @Query()
    faqFilterDto: FaqFilterDto,
    @Headers() headers: object
  ) {
    return this.service.getAllFaqs(faqFilterDto, headers['referer']);
  }

  @Post()
  saveFaq(@Body() faqDto: FaqDto) {
    return this.service.store(faqDto);
  }

  @Delete(':id')
  deleteFaq(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Put(':id')
  @UseInterceptors(new InjectRequestInterceptor(['params']))
  updateFaq(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFaqDto: UpdateFaqDto
  ) {
    return this.service.update(id, updateFaqDto);
  }
}
