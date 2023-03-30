import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from 'src/exception/not-found.exception';
import { Pagination } from 'src/paginate';
import { Connection, In, IsNull, Not } from 'typeorm';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategorySerializer } from './serializer/category.serializer';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entity/category.entity';
import { existsSync, unlinkSync } from 'fs';
import * as config from 'config';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { ProviderInformationEntity } from 'src/provider/entity/provider-information.entity';
import { UserStatusEnum } from 'src/auth/user-status.enum';

const appConfig = config.get('app');

@Injectable()
export class CategoryService {
  constructor(
    @InjectConnection()
    protected readonly connection: Connection,
    @InjectRepository(CategoryRepository)
    private repository: CategoryRepository
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<CategorySerializer> {
    if (!createCategoryDto.parentId) {
      createCategoryDto.parentId = null;
    }
    if (createCategoryDto.parentId) {
      const parent = await this.repository.findOne(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException();
      }
    }
    return this.repository.store(createCategoryDto);
  }

  async findAll(
    categoryFilterDto: CategoryFilterDto,
    referer?: string,
    countryId?: number
  ): Promise<Pagination<CategorySerializer>> {
    const { mode } = categoryFilterDto;
    const searchCriteria = {};
    if (mode && mode !== 'all') {
      if (mode === 'parent') {
        searchCriteria['parentId'] = IsNull();
      } else {
        searchCriteria['parentId'] = Not(IsNull());
      }
    }
    if (referer !== appConfig.frontendUrl + '/') {
      searchCriteria['status'] = true;
    }
    if (countryId) {
      searchCriteria['id'] = In(await this.getCategoryIdsByCountry(countryId));
    }
    return this.repository.paginate(
      categoryFilterDto,
      ['children', 'parent'],
      ['title', 'color'],
      {},
      searchCriteria
    );
  }

  async findOne(id: string): Promise<CategorySerializer> {
    return this.repository.get(id, ['parent', 'children']);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File
  ): Promise<CategorySerializer> {
    const category = await this.repository.findOne(id);
    await this.canBeUpdated(updateCategoryDto, category);
    if (!updateCategoryDto.parentId) {
      updateCategoryDto.parentId = null;
    }
    updateCategoryDto = Object.keys(file).length
      ? { ...updateCategoryDto, image: file.filename }
      : !!updateCategoryDto?.image
      ? { ...updateCategoryDto, image: category.image }
      : { ...updateCategoryDto, image: null };
    if (category.image && Object.keys(file).length) {
      const path = `public/images/category/${category.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/category/${category.image}`);
      }
    }
    return this.repository.updateItem(category, updateCategoryDto);
  }

  async canBeUpdated(
    updateCategoryDto: UpdateCategoryDto,
    category: CategoryEntity
  ): Promise<boolean> {
    if (!category) {
      throw new NotFoundException();
    }
    if (
      !category.parentId &&
      (await this.repository.count({
        where: {
          id: category.id
        }
      })) > 0 &&
      updateCategoryDto.parentId
    ) {
      throw new BadRequestException(
        "Can't change parent of root category that has children"
      );
    }
    return true;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    if (!category) {
      if (!category) {
        throw new NotFoundException();
      }
    }
    if (
      !category.parentId &&
      (await this.repository.count({
        where: {
          parentId: category.id
        }
      })) > 0
    ) {
      throw new BadRequestException(
        "Can't remove root category that has children."
      );
    }
    await this.repository.delete(id);
  }

  async subCategories(parentCategoryId: string, categoryFilterDto) {
    const category = await this.repository.findOne(parentCategoryId, {
      relations: ['children']
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const searchCriteria = {};
    searchCriteria['parentId'] = parentCategoryId;

    const subCategories = await this.repository.paginate(
      categoryFilterDto,
      [],
      ['title', 'color'],
      {},
      searchCriteria
    );
    return {
      category,
      subCategories
    };
  }

  activeCategories() {
    return this.repository.find({
      where: {
        // status: true,
        parentId: null
      },
      relations: ['children']
    });
  }

  async findParentBySlug(slug: string) {
    const parentCategory = await this.repository.findOne(
      {
        slug,
        parentId: null
      },
      {
        relations: ['parent', 'children']
      }
    );
    if (!parentCategory) {
      throw new NotFoundException('Category not found.');
    }
    return this.repository.transform(parentCategory, {
      groups: ['parent']
    });
  }

  async findChildCategoryBySlug(parentSlug: string, childSlug: string) {
    const parentCategory = await this.findParentBySlug(parentSlug);
    const childCategory = await this.repository.findOne(
      {
        slug: childSlug,
        parentId: parentCategory?.id ?? null
      },
      {
        relations: ['parent', 'children']
      }
    );
    if (!childCategory) {
      throw new NotFoundException('Category not found.');
    }
    return this.repository.transform(childCategory, {
      groups: ['children']
    });
  }

  async getCategoryIdsByCountry(countryId: number) {
    try {
      const categories = await this.connection
        .createQueryBuilder()
        .from(ServiceEntity, 'service')

        .innerJoin(UserEntity, 'usr', 'usr.id = service."userId"')
        .innerJoin(ProviderInformationEntity, 'ife', 'ife."userId" = usr.id')
        .where('usr.status=:status', { status: UserStatusEnum.ACTIVE })
        .andWhere('ife.countryId=:countryId', { countryId })
        .distinctOn(['service."categoryId"'])
        .select('service."categoryId"')
        .getRawMany();
      return categories.map((category) => category.categoryId);
    } catch (error) {
      console.log(error);
    }
  }
}
