import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { HomeJsonDto } from './dto/home-json.dto';

@Injectable()
export class HomeJsonService {
  jsonFilePath = `public/json/home.json`;
  storeHomeJson(homeJsonDto: HomeJsonDto) {
    if (existsSync(this.jsonFilePath)) {
      writeFileSync(this.jsonFilePath, JSON.stringify(homeJsonDto.json));
      return homeJsonDto.json;
    }
    throw new UnprocessableEntityException('Home json file is missing');
  }

  getHomeJson() {
    if (existsSync(this.jsonFilePath)) {
      return readFileSync(this.jsonFilePath, { encoding: 'utf-8' });
    }
    return {};
  }
}
