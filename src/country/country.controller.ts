import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { CountryService } from './country.service';
import { CountryDto } from './dto/country.dto';
import { CountryEntity } from './entities/country.entity';

@ApiTags('Country')
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}
  // @ApiQuery({ name: 'search scope', isArray: true, enum: searchScopeEnum })
  @Get()
  get(
    @Query()
    countryDto: // searchScope: keyof DeepPartial<CountryEntity>
    CountryDto
  ) {
    return this.countryService.findAll(countryDto);
  }
}
