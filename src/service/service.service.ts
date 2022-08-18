import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { Pagination } from 'src/paginate';
import { ILike } from 'typeorm';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceRepository } from './service.repository';
import { ServiceSerializer } from './service.serializer';

interface ICheckIds {
  userId: number;
  categoryId: string;
  subCategoryId?: string;
}

export class ServiceService {
  constructor(
    @InjectRepository(ServiceRepository)
    private readonly repository: ServiceRepository,
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}
  async create(createServiceDto: ServiceDto): Promise<ServiceSerializer> {
    const { categoryId, subCategoryId, userId } = createServiceDto;
    if (await this.validIds({ userId, categoryId, subCategoryId })) {
      return this.repository.store(createServiceDto);
    }
    throw new BadRequestException();
  }

  async findAll(
    serviceFilterDto: ServiceFilterDto
  ): Promise<Pagination<ServiceSerializer>> {
    const { keywords } = serviceFilterDto;
    let relationalSearchCriteria = {};
    if (keywords) {
      relationalSearchCriteria = {
        ...relationalSearchCriteria,
        user: {
          name: ILike(`%${keywords}%`)
        },
        category: {
          title: ILike(`%${keywords}%`)
        }
      };
    }
    return this.repository.paginate(
      serviceFilterDto,
      ['user', 'category'],
      ['title'],
      {},
      {
        status: true
      },
      relationalSearchCriteria
    );
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto
  ): Promise<ServiceSerializer> {
    const service = await this.repository.findOne(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    const { categoryId, subCategoryId, userId } = updateServiceDto;
    if (!(await this.canBeUpdate())) {
      throw new BadRequestException(
        "Service can't be updated. It has reservations"
      );
    }
    if (await this.validIds({ userId, categoryId, subCategoryId })) {
      return this.repository.updateItem(service, updateServiceDto);
    }
    throw new BadRequestException();
  }

  async findOne(id: string): Promise<ServiceSerializer> {
    return this.repository.get(id, ['user', 'category', 'subCategory']);
  }

  async validIds(ids: ICheckIds) {
    const { userId, categoryId, subCategoryId } = ids;

    if (!userId || !categoryId) {
      throw new BadRequestException('Valid provider and category is required');
    }

    const user = await this.userRepository.findOne(userId, {
      relations: ['role']
    });

    if (!user || user.role.name !== 'provider') {
      throw new BadRequestException(
        'Only user with role provider can be assigned to the service'
      );
    }

    if (subCategoryId) {
      const subCategory = await this.categoryRepository.findOne(subCategoryId, {
        where: {
          parentId: categoryId
        }
      });

      if (!subCategory) {
        throw new BadRequestException('Sub category not found');
      }
    }
    const category = await this.categoryRepository.findOne(categoryId, {
      where: { parentId: null }
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return true;
  }

  //TODO: not allow to update service if it already has reservations
  async canBeUpdate() {
    return true;
  }
}
