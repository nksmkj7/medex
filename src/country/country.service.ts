import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { PaginationInfoInterface } from 'src/paginate/pagination-info.interface';
import { Connection, ObjectLiteral } from 'typeorm';
import { CityDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';
import { OperatingCountryDto } from './dto/operating-country.dto';
import { PlaceDto } from './dto/place.dto';

import { UpdateCityDto } from './dto/update-city.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CityEntity } from './entities/ city.entity';
import { CountryEntity } from './entities/country.entity';
import { OperatingCountryEntity } from './entities/operating-country.entity';
import { PlaceEntity } from './entities/place.entity';
import { difference } from 'lodash';
import { slugify } from 'src/common/helper/general.helper';

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
    return country;
  }

  async storeCities(cityDto: CityDto) {
    const { name, countryId } = cityDto;
    const values = name.split(',').map((cityName) => {
      return {
        name: cityName.trim(),
        countryId,
        slug: slugify(cityName.trim())
      };
    });
    return this.connection
      .createQueryBuilder()
      .insert()
      .into(CityEntity)
      .values(values)
      .orIgnore(true)
      .execute();
  }

  async deleteCity(cityId: string) {
    return this.connection.createEntityManager().delete(CityEntity, {
      id: cityId
    });
  }

  async updateCity(cityId: string, updateCityDto: UpdateCityDto) {
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
    const updatedCity = this.connection.manager.merge(
      CityEntity,
      city,
      updateCityDto
    );
    return await updatedCity.save();
  }

  async getPlaces(countryId: number, cityId: string) {
    return this.connection.createEntityManager().find(PlaceEntity, {
      where: {
        countryId,
        cityId
      }
    });
  }

  async storePlaces(placeDto: PlaceDto) {
    const { name, countryId, cityId } = placeDto;
    const values = name.split(',').map((placeName) => {
      return {
        name: placeName.trim(),
        countryId,
        cityId,
        slug: slugify(placeName.trim())
      };
    });
    return this.connection
      .createQueryBuilder()
      .insert()
      .into(PlaceEntity)
      .values(values)
      .orIgnore(true)
      .execute();
  }

  async updatePlace(ids: ObjectLiteral, updatePlaceDto: UpdatePlaceDto) {
    const { placeId, countryId, cityId } = ids;
    const city = await this.connection
      .createEntityManager()
      .findOne(CityEntity, {
        countryId: countryId,
        id: cityId
      });
    if (!city) {
      throw new NotFoundException('City not found.');
    }
    const place = await this.connection
      .createEntityManager()
      .findOne(PlaceEntity, {
        where: {
          id: placeId
        }
      });
    if (!place) {
      throw new NotFoundException('Place not found.');
    }
    const updatedPlace = this.connection.manager.merge(
      PlaceEntity,
      place,
      updatePlaceDto
    );
    return await updatedPlace.save();
  }

  async deletePlace(placeId: string) {
    return this.connection.createEntityManager().delete(PlaceEntity, {
      id: placeId
    });
  }

  getOperatingCountries() {
    return this.connection.createEntityManager().find(OperatingCountryEntity, {
      relations: ['country']
    });
  }

  async saveOperatingCountries(operatingCountryDto: OperatingCountryDto) {
    const operatingCountriesId = await this.connection
      .createQueryBuilder()
      .from(OperatingCountryEntity, 'c')
      .select('c."countryId"')
      .getRawMany();
    const countryIdsToBeStore = difference(
      operatingCountryDto.countryId,
      operatingCountriesId.map((country) => country.countryId)
    );
    if (!(await this.checkValidCountryIds(countryIdsToBeStore))) {
      throw new BadRequestException(
        'Provided country list has one of the invalid country id'
      );
    }
    const values = countryIdsToBeStore.map((countryId: number) => {
      return {
        countryId
      };
    });
    return this.connection
      .createQueryBuilder()
      .insert()
      .into(OperatingCountryEntity)
      .values(values)
      .execute();
  }

  async checkValidCountryIds(countryIds: number[]) {
    const allCountryIds = await this.connection
      .createQueryBuilder()
      .from(CountryEntity, 'country')
      .select('id')
      .cache(true)
      .getRawMany();
    const allCountryIdsArray = allCountryIds.map((country) => country.id);
    return difference(countryIds, allCountryIdsArray).length === 0;
  }

  deleteOperatingCountry(operatingCountryId: string) {
    return this.connection
      .createEntityManager()
      .delete(OperatingCountryEntity, {
        id: operatingCountryId
      });
  }

  async getOperatingCity(cityId: string) {
    const city = await this.connection
      .createEntityManager()
      .findOne(CityEntity, {
        where: {
          id: cityId
        },
        relations: ['country']
      });
    if (!city) {
      throw new NotFoundException('City not found.');
    }
    return city;
  }

  async getOperatingPlace(placeId: string) {
    const place = await this.connection
      .createEntityManager()
      .findOne(PlaceEntity, {
        where: {
          id: placeId
        },
        relations: ['country', 'city']
      });
    if (!place) {
      throw new NotFoundException('Place not found.');
    }
    return place;
  }
}
