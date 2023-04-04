import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getPaginationInfo } from 'src/common/helper/general.helper';
import { CountryDto } from 'src/country/dto/country.dto';
import { Connection } from 'typeorm';
import { HomeJsonSearchDto } from './dto/home-json-search.dto';
import { HomeJsonDto } from './dto/home-json.dto';
import { UpdateHomeJsonDto } from './dto/update-home-json.dto';
import { HomeJsonEntity } from './entity/home-json.entity';

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

  // getHomeJson() {
  //   if (existsSync(this.jsonFilePath)) {
  //     return readFileSync(this.jsonFilePath, { encoding: 'utf-8' });
  //   }
  //   return {};
  // }

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
    // const updatedHomethis.connection.manager.merge(HomeJsonEntity,homeJson,updateHomeJsonDto)
  }
}
