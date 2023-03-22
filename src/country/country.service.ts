import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { PaginationInfoInterface } from 'src/paginate/pagination-info.interface';
import { Connection } from 'typeorm';
import { CityDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';
import { CityEntity } from './entities/ city.entity';
import { CountryEntity } from './entities/country.entity';

@Injectable()
export class CountryService {
  constructor(@InjectConnection() protected readonly connection: Connection) {}
  async findAll(countryDto: CountryDto) {
    const query = this.connection
      .createQueryBuilder()
      .from(CountryEntity, 'countries');
    const { searchScopes, keywords, ...searchFilter } = countryDto;

    if (searchScopes) {
      query.select(searchScopes.map((scope) => `countries.${scope}`));
    } else {
      query.select(['countries.*']);
    }
    const { limit, page, skip } = this.getPaginationInfo(searchFilter);

    if (keywords) {
      query.where('countries.name ilike :countryName', {
        countryName: `%${keywords}%`
      });
    }
    const queryClone = query.clone();
    if (limit) {
      query.limit(limit);
    }
    if (skip) {
      query.skip(skip);
    }

    return {
      result: await query.getRawMany(),
      pageSize: limit,
      currentPage: page,
      total: await queryClone.getCount()
    };
  }

  getPaginationInfo(options): PaginationInfoInterface {
    const page =
      typeof options.page !== 'undefined' && options.page > 0
        ? options.page
        : 1;
    const limit =
      typeof options.limit !== 'undefined' && options.limit > 0
        ? options.limit
        : 10;
    return {
      skip: (page - 1) * limit,
      limit,
      page
    };
  }

  async getCities(countryId: number) {
    const country = await this.connection
      .createEntityManager()
      .findOne(CountryEntity, {
        where: {
          id: countryId
        },
        relations: ['cities']
      });

    if (!country) {
      throw new NotFoundException('Country not found.');
    }
    return country.cities;
  }

  async storeCities(cityDto: CityDto) {
    const city = this.connection
      .createEntityManager()
      .create(CityEntity, cityDto);
    return await city.save();
  }

  async deleteCity(cityId: string) {
    return this.connection.createEntityManager().delete(CityEntity, {
      where: {
        id: cityId
      }
    });
  }

  async updateCity(cityId: string, updateCityDto) {
    const city = await this.connection
      .createEntityManager()
      .findOne(CityEntity, {
        where: {
          id: cityId
        }
      });
    if (!city) {
      throw new NotFoundException('City not found.');
    }
    return this.connection.manager.merge(CityEntity, city, updateCityDto);
  }
}
