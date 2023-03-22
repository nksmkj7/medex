import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { CityControllerController } from './city-controller/city-controller.controller';

@Module({
  controllers: [CountryController, CityControllerController],
  providers: [CountryService]
})
export class CountryModule {}
