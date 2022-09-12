import {
  BadRequestException,
  Injectable,
  PreconditionFailedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from 'src/exception/not-found.exception';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { Pagination } from 'src/paginate';
import { MenuRepository } from './menu.repository';
import { CreateMenuDto } from './dto/create-menu.dto';
// import { MenuSerializer } from './serializer/menu.serializer';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuSerializer } from './serializer/menu.serializer';
import { MenuFilterDto, SubMenuFilterDto } from './dto/menu-filter.dto';
import { IsNull, Not } from 'typeorm';
import { MenuEntity } from './entity/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuRepository)
    private repository: MenuRepository
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuSerializer> {
    if (!createMenuDto.parentId) {
      createMenuDto.parentId = null;
    } else if (createMenuDto.parentId) {
      if (createMenuDto.menuType === 'dropdown') {
        throw new PreconditionFailedException(
          'Child cannot have dropdown as parent'
        );
      }
      const parent = await this.repository.findOne(createMenuDto.parentId);
      if (!parent) {
        throw new NotFoundException();
      }
      if (parent.menuType === 'direct') {
        throw new PreconditionFailedException(
          'Parent menu with direct type cannot have children menu'
        );
      }
      if (createMenuDto) {
      }
    }
    return this.repository.store(createMenuDto);
  }

  async findAll(
    menuFilterDto: MenuFilterDto
  ): Promise<Pagination<MenuSerializer>> {
    const { mode, menuType } = menuFilterDto;
    const searchCriteria = menuType
      ? {
          menuType
        }
      : {};
    if (mode && mode !== 'all') {
      if (mode === 'parent') {
        searchCriteria['parentId'] = IsNull();
      } else {
        searchCriteria['parentId'] = Not(IsNull());
      }
    }
    return this.repository.paginate(
      menuFilterDto,
      [],
      ['title', 'link'],
      {},
      searchCriteria
    );
  }

  async findOne(id: number): Promise<MenuSerializer> {
    return this.repository.get(id, ['parent', 'children']);
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto
  ): Promise<MenuSerializer> {
    const category = await this.repository.findOne(id);
    await this.canBeUpdated(updateMenuDto, category);
    if (!updateMenuDto.parentId) {
      updateMenuDto.parentId = null;
    }
    return this.repository.updateItem(category, updateMenuDto);
  }

  async canBeUpdated(
    updateMenuDto: UpdateMenuDto,
    category: MenuEntity
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
      updateMenuDto.parentId
    ) {
      throw new BadRequestException(
        "Can't change parent of root menu that has children"
      );
    }
    return true;
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    if (!menu) {
      if (!menu) {
        throw new NotFoundException();
      }
    }
    if (
      !menu.parentId &&
      (await this.repository.count({
        where: {
          parentId: menu.id
        }
      })) > 0
    ) {
      throw new BadRequestException(
        "Can't remove root menu that has children."
      );
    }
    await this.repository.delete(id);
  }

  async subMenus(parentMenuId: number, menuFilterDto: SubMenuFilterDto) {
    const menu = await this.repository.findOne(parentMenuId);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const searchCriteria = {};
    searchCriteria['parentId'] = parentMenuId;

    const subMenus = await this.repository.paginate(
      menuFilterDto,
      [],
      ['title', 'link'],
      {},
      searchCriteria
    );
    return {
      menu,
      subMenus
    };
  }
}
