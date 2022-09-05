import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { Pagination } from 'src/paginate';
import { Connection, EntityManager, ILike } from 'typeorm';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entity/service.entity';
import { ServiceSpecialistEntity } from './entity/specialist-service.entity';
import { ServiceRepository } from './service.repository';
import { ServiceSerializer } from './service.serializer';
import { difference } from 'lodash';
import { SpecialistRepository } from 'src/specialist/specialist.repository';

interface ICheckIds {
  userId: number;
  categoryId: string;
  subCategoryId?: string;
}

export class ServiceService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectRepository(ServiceRepository)
    private readonly repository: ServiceRepository,
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(SpecialistRepository)
    private readonly specialistRepository: SpecialistRepository
  ) {}
  async create(createServiceDto: ServiceDto) {
    const { categoryId, subCategoryId, userId } = createServiceDto;
    await this.validIds({ userId, categoryId, subCategoryId });
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const service = manager.create(ServiceEntity, createServiceDto);
      await manager.save(service);
      await this.assignSpecialistToService(manager, service, {
        specialistIds: createServiceDto.specialistIds ?? [],
        additionalTime: createServiceDto.additionalTime ?? 0,
        startTime: createServiceDto.startTime ?? null,
        endTime: createServiceDto.endTime ?? null
      });
      await queryRunner.commitTransaction();
      return this.repository.transform(service);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const queryRunner = this.connection.createQueryRunner();
    const manager = queryRunner.manager;
    const service = await this.repository.findOne(id, {
      relations: ['specialists']
    });
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    await queryRunner.startTransaction();
    await queryRunner.connect();
    try {
      const { categoryId, subCategoryId, userId } = updateServiceDto;
      if (!(await this.canBeUpdate())) {
        throw new BadRequestException(
          "Service can't be updated. It has reservations"
        );
      }
      await this.validIds({ userId, categoryId, subCategoryId });
      const { specialists, ...serviceOnlyData } = service;
      const updatedService = manager.merge(
        ServiceEntity,
        service,
        updateServiceDto
      );
      let updatedServiceSpecialistsDataPromises = [];

      //syncing specialist id to service and also updating additional, startTime and endTime for
      //synced specialist of this service
      updatedService.specialists = specialists.filter((specialist) => {
        if (updateServiceDto.specialistIds.includes(specialist.id)) {
          updatedServiceSpecialistsDataPromises.push(
            manager.update(
              ServiceSpecialistEntity,
              {
                serviceId: id,
                specialistId: specialist.id
              },
              {
                additionalTime: updateServiceDto.additionalTime,
                startTime: updateServiceDto.startTime ?? null,
                endTime: updateServiceDto.endTime ?? null
              }
            )
          );
          return true;
        }
      });

      await Promise.allSettled(updatedServiceSpecialistsDataPromises);

      await manager.save(updatedService);
      await queryRunner.commitTransaction();
      return this.repository.transform(updatedService);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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

  assignSpecialistToService(
    manager: EntityManager,
    service: ServiceEntity,
    serviceSpecialistData: {
      specialistIds: string[];
      additionalTime: number;
      startTime: string | null;
      endTime: string | null;
    }
  ) {
    const { additionalTime, startTime, endTime } = serviceSpecialistData;
    return Promise.all(
      serviceSpecialistData.specialistIds.map((specialistId) => {
        const serviceWithSpecialist = manager.create(ServiceSpecialistEntity, {
          serviceId: service.id,
          specialistId,
          additionalTime,
          startTime,
          endTime
        });
        return manager.save(serviceWithSpecialist);
      })
    );
  }

  async findServiceSpecialists(id: string) {
    const service = await this.repository.findOneOrFail(id, {
      relations: ['specialists']
    });
    return this.specialistRepository.transformMany(service.specialists);
  }

  async getSpecialistService(serviceId: string, specialistId: string) {
    const specialistServiceDetail = await this.connection.manager
      .createQueryBuilder()
      .from(ServiceSpecialistEntity, 's')
      .where('s.serviceId = :serviceId', {
        serviceId
      })
      .andWhere('s.specialistId = :specialistId', {
        specialistId
      })
      .innerJoin('s.service', 'service')
      .select(
        's."additionalTime", s."startTime",s."endTime",service."durationInMinutes"'
      )
      .getRawOne();
    if (!specialistServiceDetail) {
      throw new NotFoundException(
        'Such service for  specialist does not exists.'
      );
    }
    return specialistServiceDetail;
  }
}