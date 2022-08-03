import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { MenuEntity } from './entity/menu.entity';
import { MenuSerializer } from './serializer/menu.serializer';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(MenuEntity)
export class MenuRepository extends BaseRepository<MenuEntity, MenuSerializer> {
  async store(createMenuDto: CreateMenuDto): Promise<MenuSerializer> {
    const menu = this.create(createMenuDto);
    await menu.save();
    return this.transform(menu);
  }

  async updateItem(
    menu: MenuEntity,
    updateMenuDto: UpdateMenuDto
  ): Promise<MenuSerializer> {
    const updatedBanner = this.merge(menu, updateMenuDto);
    await updatedBanner.save();
    return this.transform(updatedBanner);
  }

  async get(
    id: number,
    relations: string[] = [],
    transformOptions = {}
  ): Promise<MenuSerializer | null> {
    return await this.findOne({
      where: {
        id
      },
      relations
    })
      .then((entity) => {
        transformOptions['groups'] = !entity.parentId
          ? ['parent']
          : ['children'];
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }

        return Promise.resolve(
          entity ? this.transform(entity, transformOptions) : null
        );
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  transform(model: MenuEntity, transformOption = {}): MenuSerializer {
    return plainToClass(
      MenuSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(models: MenuEntity[], transformOption = {}): MenuSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
