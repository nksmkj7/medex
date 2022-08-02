import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from 'src/exception/not-found.exception';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { Pagination } from 'src/paginate';
import { MenuRepository } from './menu.repository';
import { CreateMenuDto } from './dto/create-menu.dto';
// import { MenuSerializer } from './serializer/menu.serializer';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuSerializer } from './serializer/menu.serializer';
import { MenuFilterDto } from './dto/menu-filter.dto';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuRepository)
    private repository: MenuRepository
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuSerializer> {
    if (createMenuDto.parentId) {
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
    return this.repository.get(id);
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto
  ): Promise<MenuSerializer> {
    const menu = await this.repository.findOne(id);
    if (!menu) {
      throw new NotFoundException();
    }

    return this.repository.updateItem(menu, updateMenuDto);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    if (!menu) {
      if (!menu) {
        throw new NotFoundException();
      }
    }
    await this.repository.delete({ id });
  }
}
