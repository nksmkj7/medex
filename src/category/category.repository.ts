import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { NotFoundException } from '@nestjs/common';
import { CategoryEntity } from './entity/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategorySerializer } from './serializer/category.serializer';
import { UpdateCategoryDto } from './dto/update-category.dto';

@EntityRepository(CategoryEntity)
export class CategoryRepository extends BaseRepository<
  CategoryEntity,
  CategorySerializer
> {
  async store(
    createCategoryDto: CreateCategoryDto
  ): Promise<CategorySerializer> {
    const menu = this.create(createCategoryDto);
    await menu.save();
    return this.transform(menu);
  }

  async updateItem(
    menu: CategoryEntity,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<CategorySerializer> {
    const updatedBanner = this.merge(menu, updateCategoryDto);
    await updatedBanner.save();
    return this.transform(updatedBanner);
  }

  async get(
    id: number | string,
    relations: string[] = [],
    transformOptions = {}
  ): Promise<CategorySerializer | null> {
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

  transform(model: CategoryEntity, transformOption = {}): CategorySerializer {
    return plainToClass(
      CategorySerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: CategoryEntity[],
    transformOption = {}
  ): CategorySerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
