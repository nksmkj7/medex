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
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { CountryService } from './country.service';
import { CityDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';
import { UpdateCityDto } from './dto/update-city.dto';
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

  @Delete('/cities/:cityId')
  deleteCity(@Param('cityId', ParseUUIDPipe) cityId: string) {
    return this.countryService.deleteCity(cityId);
  }

  @Put('/cities/:cityId')
  updateCity(
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Body() updateCityDto: UpdateCityDto
  ) {
    return this.countryService.updateCity(cityId, updateCityDto);
  }

  @ApiOperation({
    summary: "get country's cities"
  })
  @Get(':id/cities/:cityId/places')
  getPlaces(
    @Param('id', ParseIntPipe) id: number,
    @Param('cityId', ParseIntPipe) cityId: string
  ) {
    return this.countryService.getPlaces(id);
  }

  @ApiOperation({
    summary: 'store country cities'
  })
  @Post(':id/cities')
  saveCities(@Body() cityDto: CityDto) {
    return this.countryService.storeCities(cityDto);
  }

  @Delete('/cities/:cityId')
  deleteCity(@Param('cityId', ParseUUIDPipe) cityId: string) {
    return this.countryService.deleteCity(cityId);
  }

  @Put('/cities/:cityId')
  updateCity(
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Body() updateCityDto: UpdateCityDto
  ) {
    return this.countryService.updateCity(cityId, updateCityDto);
  }
}
