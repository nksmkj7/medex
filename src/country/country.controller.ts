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
import { OperatingCountryDto } from './dto/operating-country.dto';
import { PlaceDto } from './dto/place.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CountryEntity } from './entities/country.entity';
import { OperatingCountryEntity } from './entities/operating-country.entity';
import { PlaceEntity } from './entities/place.entity';

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
    summary: 'get places by city and country id'
  })
  @Get(':countryId/cities/:cityId/places')
  getPlaces(
    @Param('countryId', ParseIntPipe) countryId: number,
    @Param('cityId', ParseUUIDPipe) cityId: string
  ) {
    return this.countryService.getPlaces(countryId, cityId);
  }

  @ApiOperation({
    summary: 'store places'
  })
  @Post(':countryId/cities/:cityId/places')
  savePlaces(@Body() placeDto: PlaceDto) {
    return this.countryService.storePlaces(placeDto);
  }

  @Delete('places/:placeId')
  deletePlace(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.countryService.deletePlace(placeId);
  }

  @Put(':id/cities/:cityId/places/:placeId')
  updatePlace(
    @Param('id', ParseIntPipe) countryId: number,
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Param('cityId', ParseUUIDPipe) cityId: string,
    @Body() updatePlaceDto: UpdatePlaceDto
  ) {
    return this.countryService.updatePlace(
      {
        countryId,
        placeId,
        cityId
      },
      updatePlaceDto
    );
  }

  @ApiOperation({
    summary: 'get operating countries list'
  })
  @Get('operating-countries')
  getOperatingCountries() {
    return this.countryService.getOperatingCountries();
  }

  @ApiOperation({
    summary: 'store operating countries'
  })
  @Post('operating-countries')
  saveOperatingCountries(@Body() operatingCountryDto: OperatingCountryDto) {
    return this.countryService.saveOperatingCountries(operatingCountryDto);
  }

  @ApiOperation({
    summary: 'Delete operating country'
  })
  @Delete('operating-countries/:id')
  deleteOperatingCountry(
    @Param('id', ParseUUIDPipe) operatingCountryId: string
  ) {
    return this.countryService.deleteOperatingCountry(operatingCountryId);
  }

  @ApiOperation({
    summary: 'Get operating city by city id'
  })
  @Get('/cities/:cityId')
  getOperatingCity(@Param('cityId', ParseUUIDPipe) cityId: string) {
    return this.countryService.getOperatingCity(cityId);
  }

  @ApiOperation({
    summary: 'Get operating place by place id'
  })
  @Get('/places/:placeId')
  getOperatingPlace(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.countryService.getOperatingPlace(placeId);
  }
}
