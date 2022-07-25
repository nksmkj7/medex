import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { PaginationInfoInterface } from 'src/paginate/pagination-info.interface';
import { Connection } from 'typeorm';
import { CountryDto } from './dto/country.dto';
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
}
