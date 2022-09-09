import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from 'src/exception/not-found.exception';
import { Pagination } from 'src/paginate';
import { Connection, IsNull, Not } from 'typeorm';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategorySerializer } from './serializer/category.serializer';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entity/category.entity';
import { existsSync, unlinkSync } from 'fs';

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
    categoryFilterDto: CategoryFilterDto
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
    return this.repository.paginate(
      categoryFilterDto,
      [],
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
    updateCategoryDto = file
      ? { ...updateCategoryDto, image: file.filename }
      : { ...updateCategoryDto, image: category.image };
    if (category.image && file) {
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
}
