import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { MenuEntity } from './entity/menu.entity';
import { MenuSerializer } from './serializer/menu.serializer';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

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

  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: MenuEntity, transformOption = {}): MenuSerializer {
    return plainToClass(
      MenuSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform array of roles
   * @param models
   * @param transformOption
   */
  transformMany(models: MenuEntity[], transformOption = {}): MenuSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
