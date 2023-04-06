import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import dayjs = require('dayjs');
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { CategoryEntity } from 'src/category/entity/category.entity';
import { getPaginationInfo } from 'src/common/helper/general.helper';
import { CountryDto } from 'src/country/dto/country.dto';
import { Brackets, Connection, ObjectLiteral } from 'typeorm';
import { HomeJsonSearchDto } from './dto/home-json-search.dto';
import { HomeJsonDto } from './dto/home-json.dto';
import { UpdateHomeJsonDto } from './dto/update-home-json.dto';
import { HomeJsonEntity } from './entity/home-json.entity';
import { HomeJsonTypeEnum } from './enum/home-json-type.enun';
import * as config from 'config';
const appConfig = config.get('app');

@Injectable()
export class HomeJsonService {
  constructor(@InjectConnection() private connection: Connection) {}

  // jsonFilePath = `public/json/home.json`;
  storeHomeJson(homeJsonDto: HomeJsonDto) {
    // if (existsSync(this.jsonFilePath)) {
    //   writeFileSync(this.jsonFilePath, JSON.stringify(homeJsonDto.json));
    //   return homeJsonDto.json;
    // }
    // throw new UnprocessableEntityException('Home json file is missing');

    const homeJson = this.connection
      .createEntityManager()
      .create(HomeJsonEntity, homeJsonDto);
    return homeJson.save();
  }

  async getHomeJson(countryId: number) {
    const today = dayjs().format('YYYY-MM-DD');
    const homeJsonData = await this.connection
      .createQueryBuilder()
      .from(HomeJsonEntity, 'home_json')
      .where(
        new Brackets((qb) => {
          qb.where('home_json."startDate" is null').orWhere(
            new Brackets((qb) =>
              qb
                .where(`home_json."startDate" <= :today`, { today })
                .andWhere(`home_json."expiryDate" >= :today`, { today })
            )
          );
        })
      )
      .orderBy('position')
      .getRawMany();
    return await this.generateHomeJson(homeJsonData);
  }

  async findAll(homeJsonSearchDto: HomeJsonSearchDto) {
    const query = this.connection
      .createQueryBuilder()
      .from(HomeJsonEntity, 'home_json');
    const { keywords, ...searchFilter } = homeJsonSearchDto;

    const { limit, page, skip } = getPaginationInfo(searchFilter);

    if (keywords) {
      query.where('home_json.title ilike :title', {
        title: `%${keywords}%`
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

  async findById(id: string) {
    const homeJson = await this.connection
      .createEntityManager()
      .findOne(HomeJsonEntity, {
        id
      });

    if (!homeJson) {
      throw new NotFoundException('Home json data not found.');
    }
    return homeJson;
  }

  async update(homeJsonId: string, updateHomeJsonDto: UpdateHomeJsonDto) {
    const homeJson = await this.findById(homeJsonId);
    const updatedHomeJson = this.connection.manager.merge(
      HomeJsonEntity,
      homeJson,
      updateHomeJsonDto
    );
    return updatedHomeJson.save();
  }

  async delete(homeJsonId: string) {
    const homeJson = await this.findById(homeJsonId);
    return homeJson.remove();
  }

  async generateHomeJson(homeJsonDbData: any[]) {
    const promises = [];
    homeJsonDbData.map((homeJsonData) => {
      promises.push(this.getHomeJsonData(homeJsonData));
    });
    const modules = await Promise.allSettled(promises);
    return this.onlyGetFulfilledData(modules);
  }

  getHomeJsonData(homeJsonData: ObjectLiteral) {
    switch (homeJsonData.moduleType) {
      case HomeJsonTypeEnum.CATEGORIES: {
        return this.getCategoryHomeJsonData(homeJsonData);
      }
    }
  }

  async getCategoryHomeJsonData(categoryHomeJsonData: ObjectLiteral) {
    const content = categoryHomeJsonData.content;
    const categoryIds = content.categories;
    const categories = await this.connection
      .createQueryBuilder()
      .from(CategoryEntity, 'categories')
      .select([
        'categories.id as id',
        'categories.title as title',
        'categories."shortDescription" as desc',
        'categories.slug as slug',
        `case when(categories.image is not null) then :imageUrl || categories.image end as image`
      ])
      .whereInIds(categoryIds)
      .setParameter('imageUrl', `${appConfig.appUrl}/images/category/`)
      .getRawMany();
    categoryHomeJsonData['data'] = categories;
    const { id, moduleType: type, position, data } = categoryHomeJsonData;
    return { id, type, position, data };
  }

  onlyGetFulfilledData(promiseResults: PromiseSettledResult<any>[]) {
    const fulfilledResult = [];
    promiseResults.forEach((promiseResult: { status: string; value?: any }) => {
      if (promiseResult.status === 'fulfilled') {
        fulfilledResult.push(promiseResult.value);
      }
    });
    return fulfilledResult;
  }
}
