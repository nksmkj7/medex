import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { CountryService } from './country.service';
import { CityDto } from './dto/city.dto';
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

  @ApiOperation({
    summary: "get country's cities"
  })
  @Get(':id/cities')
  getCities(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.getCities(id);
  }

  @ApiOperation({
    summary: 'store country cities'
  })
  @Post(':id/cities')
  saveCities(@Body() cityDto: CityDto) {
    return this.countryService.storeCities(cityDto);
  }

  // @Delete(':id/cities/:cityId')
  // deleteCity()
}
