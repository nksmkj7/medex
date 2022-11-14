import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { StaticPageEntity } from './entity/static-page.entity';

@Injectable()
export class StaticPageService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  getStaticPageBySlug(slug: string) {
    return this.connection
      .createQueryBuilder(StaticPageEntity, 'staticPage')
      .select(['staticPage.title', 'staticPage.slug', 'staticPage.content'])
      .where(`slug=:slug`, { slug })
      .getOneOrFail();
  }

  async updateStaticPage(id: string, updateStaticPageDto: UpdateStaticPageDto) {
    const page = await this.connection
      .createEntityManager()
      .findOne(StaticPageEntity, {
        id
      });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    page.content = updateStaticPageDto.content;
    await page.save();
    return page;
  }

  deleteStaticPage(id: string) {
    return this.connection.createEntityManager().delete(StaticPageEntity, {
      id
    });
  }

  getStaticPageList() {
    return this.connection.createEntityManager().find(StaticPageEntity);
  }
}
