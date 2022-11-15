import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { slugify } from 'src/common/helper/general.helper';
import { Connection } from 'typeorm';
import { StaticPageDto } from './dto/static-page.dto';
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

  store(staticPageDto: StaticPageDto) {
    return this.connection.createEntityManager().save(StaticPageEntity, {
      ...staticPageDto,
      slug: slugify(staticPageDto.title)
    });
  }
}
