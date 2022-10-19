import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { Pagination } from 'src/paginate';
import { Connection, EntityManager, ILike, In } from 'typeorm';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entity/service.entity';
import { ServiceSpecialistEntity } from './entity/specialist-service.entity';
import { ServiceRepository } from './service.repository';
import { ServiceSerializer } from './service.serializer';
import { omit } from 'lodash';
import { SpecialistRepository } from 'src/specialist/specialist.repository';
import { SpecialistFilterDto } from 'src/specialist/dto/specialist-filter.dto';
import { AssignSpecialistDto } from './dto/assign-specialist.dto';
import { UpdateAssignSpecialistDto } from './dto/update-assign-specialist.dto';
import { CategoryProviderServiceDto } from './dto/category-provider-service.dto';

interface ICheckIds {
  userId: number;
  categoryId: string;
  subCategoryId?: string;
}

export interface IProviderWithService {
  provider_id: number;
  company_name: string;
  [index: string]: string | number;
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
      throw error;
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
        },
        subCategory: {
          title: ILike(`%${keywords}%`)
        }
      };
    }
    return this.repository.paginate(
      serviceFilterDto,
      ['user', 'category', 'subCategory'],
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
      // let updatedServiceSpecialistsDataPromises = [];

      // //syncing specialist id to service and also updating additional, startTime and endTime for
      // //synced specialist of this service
      // updatedService.specialists = specialists.filter((specialist) => {
      //   if (updateServiceDto.specialistIds.includes(specialist.id)) {
      //     updatedServiceSpecialistsDataPromises.push(
      //       manager.update(
      //         ServiceSpecialistEntity,
      //         {
      //           serviceId: id,
      //           specialistId: specialist.id
      //         },
      //         {
      //           additionalTime: updateServiceDto.additionalTime,
      //           startTime: updateServiceDto.startTime ?? null,
      //           endTime: updateServiceDto.endTime ?? null
      //         }
      //       )
      //     );
      //     return true;
      //   }
      // });

      // await Promise.allSettled(updatedServiceSpecialistsDataPromises);

      await manager.save(updatedService);
      await queryRunner.commitTransaction();
      return this.repository.transform(updatedService);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      status?: boolean;
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

  async findServiceSpecialists(
    id: string,
    specialistFilterDto: SpecialistFilterDto
  ) {
    const service = await this.repository.findOneOrFail(id, {
      relations: ['specialists']
    });
    const relatedSpecialistId = service.specialists.map(
      (specialist) => specialist.id
    );
    const specialists = await this.specialistRepository.paginate(
      specialistFilterDto,
      [],
      [
        'fullName',
        'contactNo',
        'licenseRegistrationNumber',
        'educationTraining',
        'experienceExpertise',
        'publicAwards',
        'membershipActivities'
      ],
      {},
      {
        id: In(relatedSpecialistId)
      }
    );
    const transformedService = this.repository.transform(service);
    return { ...specialists, service: transformedService };
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

  async assignServiceSpecialist(
    serviceId: string,
    assignSpecialistDto: AssignSpecialistDto
  ) {
    const service = await this.repository.findOne(serviceId, {
      relations: ['specialists']
    });
    const serviceSpecialistIds = service.specialists.map(
      (specialist) => specialist.id
    );
    for (const specialistId of assignSpecialistDto.specialistIds) {
      if (serviceSpecialistIds.includes(specialistId)) {
        throw new BadRequestException(
          'One of the specialist has already been assigned to the service'
        );
      }
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await this.assignSpecialistToService(manager, service, {
        specialistIds: assignSpecialistDto.specialistIds ?? [],
        additionalTime: assignSpecialistDto.additionalTime ?? 0,
        startTime: assignSpecialistDto.startTime ?? null,
        endTime: assignSpecialistDto.endTime ?? null,
        status: assignSpecialistDto.status ?? true
      });
      await queryRunner.commitTransaction();
      return this.repository.transform(service);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateSpecialistService(
    serviceId: string,
    specialistId: string,
    updateAssignSpecialistDto: UpdateAssignSpecialistDto
  ) {
    try {
      const manager = this.connection.manager;
      const serviceSpecialist = await manager.findOne(ServiceSpecialistEntity, {
        serviceId,
        specialistId
      });
      manager.merge(
        ServiceSpecialistEntity,
        serviceSpecialist,
        updateAssignSpecialistDto
      );
      await manager.save(serviceSpecialist);
      return serviceSpecialist;
    } catch (error) {
      throw error;
    }
  }

  async getProviderService(
    categoryProviderServiceDto: CategoryProviderServiceDto
  ) {
    const {
      categoryId,
      subCategoryId,
      keywords,
      page = 1,
      limit = 4
    } = categoryProviderServiceDto;
    const query = this.connection.createQueryBuilder(ServiceEntity, 'service');
    query.where(`service.categoryId=:categoryId`, {
      categoryId
    });
    if (subCategoryId) {
      query.andWhere('service.subCategoryId = :subCategoryId', {
        subCategoryId
      });
    }
    const offset = (page - 1) * limit;
    const totalCategoryAssociatedProvidersCount = await query
      .clone()
      .select('COUNT (DISTINCT service.userId)')
      .getRawOne();
    let categoryAssociatedProviders = await query
      .clone()
      .select('distinct service.userId')
      .offset(offset)
      .limit(limit)
      .getRawMany();
    categoryAssociatedProviders = categoryAssociatedProviders.map(
      (provider) => provider.userId
    );

    const subQuery = query
      .clone()
      .select([
        'service.title as title',
        'service.price as price',
        'service.userId as provider_id',
        'provider.companyName as company_name',
        'ROW_NUMBER() OVER (PARTITION BY service.userId)'
      ])
      .leftJoin(
        'provider_informations',
        'provider',
        'provider.userId = service.userId'
      )
      .andWhere('service.userId In (:...users)', {
        users: [...categoryAssociatedProviders]
      });

    const providerWithService = await this.connection
      .createQueryBuilder()
      .from('(' + subQuery.getQuery() + ')', 'ss')
      .setParameters(subQuery.getParameters())
      .select('*')
      .andWhere('ss."row_number" < :number', {
        number: 4
      })
      .getRawMany();

    return {
      results: this.groupProviderWithService(providerWithService),
      totalItems: +totalCategoryAssociatedProvidersCount?.count ?? 0,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next:
        +totalCategoryAssociatedProvidersCount.count > offset + limit
          ? page + 1
          : 0
    };
  }

  groupProviderWithService(providerWithService: IProviderWithService[]) {
    const getFormattedData = (data: IProviderWithService) => {
      return omit(data, ['row_number', 'provider_id', 'company_name']);
    };
    return providerWithService.reduce(
      (
        prevValue: {
          company_name: string;
          provider_id: number;
          services: { [index: string]: string }[];
        }[],
        currentValue: IProviderWithService
      ) => {
        let currentProvider =
          prevValue.length > 0
            ? prevValue.find(
                (value) => value.provider_id === currentValue.provider_id
              )
            : null;
        if (!currentProvider) {
          prevValue.push({
            company_name: currentValue.company_name,
            provider_id: currentValue.provider_id,
            services: [getFormattedData(currentValue)]
          });
        } else {
          currentProvider.services.push(getFormattedData(currentValue));
        }
        return prevValue;
      },
      []
    );
  }
}
