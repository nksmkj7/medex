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
import { ProviderBannerEntity } from 'src/provider/entity/provider-banner.entity';
import * as config from 'config';
import { SearchCategoryProvideServiceDto } from './dto/search-category-provider-service.dto';
import { BookingEntity } from 'src/booking/entity/booking.entity';
import { existsSync, unlinkSync } from 'fs';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CategoryEntity } from 'src/category/entity/category.entity';
const appConfig = config.get('app');

interface ICheckIds {
  userId: number;
  categoryId: string;
  subCategoryId?: string;
}

export interface IProviderWithService {
  provider_id: number;
  company_name: string;
  logo?: string;
  city?: string;
  state?: string;
  landmark?: string;
  banner?: string;
  banner_link?: string;
  category_title: string;
  service_image?:string;
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
      if (createServiceDto?.specialistIds?.length > 0) {
        await this.assignSpecialistToService(manager, service, {
          specialistIds: createServiceDto.specialistIds ?? [],
          additionalTime: createServiceDto.additionalTime ?? 0,
          startTime: createServiceDto.startTime ?? null,
          endTime: createServiceDto.endTime ?? null
        });
      }
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
    serviceFilterDto: ServiceFilterDto,
    referer?: string
  ): Promise<Pagination<ServiceSerializer>> {
    let searchCriteria = {};
    if (referer !== appConfig.frontendUrl+"/") {
      searchCriteria['status'] = true;
    }
    const { keywords, provider = null } = serviceFilterDto;
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
    if (provider) {
      searchCriteria['userId'] = provider;
    }
    return this.repository.paginate(
      serviceFilterDto,
      ['user', 'category', 'subCategory'],
      ['title'],
      {},
      searchCriteria,
      relationalSearchCriteria
    );
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    file?: Express.Multer.File
  ) {
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
      if (!(await this.canBeUpdate(service))) {
        throw new BadRequestException(
          "Service can't be updated. It has reservations"
        );
      }
      await this.validIds({ userId, categoryId, subCategoryId });
      const { specialists, ...serviceOnlyData } = service;
       updateServiceDto = Object.keys(file).length
      ? { ...updateServiceDto, image: file.filename }
      : { ...updateServiceDto, image: service.image };
      if (service.image && Object.keys(file).length) {
        const path = `public/images/service/${service.image}`;
        if (existsSync(path)) {
          unlinkSync(`public/images/service/${service.image}`);
        }
      }
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
  async canBeUpdate(service: ServiceEntity) {
    const bookings = await this.serviceBookings(service.id);
    return bookings.length <= 0;
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

  async getSpecialistService(serviceId: string, specialistId: string | null) {
    const query = this.connection.manager.createQueryBuilder();
    if (specialistId) {
      query
        .from(ServiceSpecialistEntity, 's')
        .select(
          's."additionalTime", s."startTime",s."endTime",service."durationInMinutes",service."scheduleType"'
        )
        .where('s.serviceId = :serviceId', {
          serviceId
        })
        .andWhere('s.specialistId = :specialistId', {
          specialistId
        })
        .innerJoin('s.service', 'service');
    } else {
      query
        .from(ServiceEntity, 'service')
        .where('service.id = :serviceId', { serviceId })
        .select(
          'service."additionalTime", service."startTime",service."endTime",service."durationInMinutes",service."scheduleType"'
        );
    }
    const specialistServiceDetail = query.getRawOne();
    if (!specialistServiceDetail) {
      let exceptionMessage = '';
      if (specialistId)
        exceptionMessage = 'Such service for  specialist does not exist.';
      else exceptionMessage = 'Service does not exist.';
      throw new NotFoundException(exceptionMessage);
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
    const query = this.connection
      .createQueryBuilder(ServiceEntity, 'service')
      .leftJoin(UserEntity,'usr','usr.id = service."userId"')
      .leftJoin(CategoryEntity,'category','category.id = service."categoryId"')
      .leftJoin(
        'provider_informations',
        'provider',
        'provider.userId = service.userId'
      )
      .where(`usr.status = :userStatus`,{userStatus: 'active'})
      .andWhere(`category.status = :categoryStatus`,{categoryStatus: true})
      .andWhere('service.status = :status', {
        status: true
      });
    query
      .where(`service.categoryId=:categoryId`, {
        categoryId
      })
      .andWhere('service.status = :status', {
        status: true
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
        'service.id as id',
        'service.title as title',
        'CAST(service.price as DOUBLE PRECISION) as price',
        'service.userId as provider_id',
        'service.durationInMinutes as duration_in_minutes',
        'service.description as description',
        `service.image as service_image`,
        'service.scheduleType as "scheduleType"',
        'CAST(service.discount as DOUBLE PRECISION) as discount',
        'CAST(service.serviceCharge as DOUBLE PRECISION) as service_charge',
        'CAST((discount/100)*price as DOUBLE PRECISION) as discounted_amount',
        'CAST((price-((discount/100)*price)) as DOUBLE PRECISION) as amount_after_discount',
        'CAST((service."serviceCharge"/100)*(price-((discount/100)*price)) as DOUBLE PRECISION) as service_charge_amount',
        'CAST((price-((discount/100)*price))+(service."serviceCharge"/100)*(price-((discount/100)*price)) as DOUBLE PRECISION) as amount_after_service_charge',
        'provider.companyName as company_name',
        'provider.businessLogo as logo',
        'provider.businessLocation as location',
        'provider.city as city',
        'provider.state as state',
        'provider.landmark as landmark',
        'ROW_NUMBER() OVER (PARTITION BY service.userId)',
        'provider_banner.image as banner',
        'provider_banner.link as banner_link',
        'category.title as category_title'
      ])
      .andWhere('service.userId In (:...users)', {
        users: [...categoryAssociatedProviders]
      })
      .leftJoin(
        (qb) =>
          qb
            .select([
              'banner.image as image',
              'banner.link as link',
              'banner.userId as userId'
            ])
            .from(ProviderBannerEntity, 'banner')
            .distinctOn(['banner."userId"'])
            .where('banner.userId In (:...users)', {
              users: [...categoryAssociatedProviders]
            })
            .andWhere('banner.status =:status', { status: true })
            .andWhere('banner.isFeatured =:status', { status: true })
            .orderBy('banner.createdAt', 'DESC')
            .orderBy('banner."userId"', 'ASC'),
        'provider_banner',
        'provider_banner.userId=service.userId'
      );

    let providerWithService = {};
    if (totalCategoryAssociatedProvidersCount.count > 0) {
      providerWithService = this.groupProviderWithService(
        await this.connection
          .createQueryBuilder()
          .from('(' + subQuery.getQuery() + ')', 'ss')
          .setParameters(subQuery.getParameters())
          .select('*')
          .andWhere('ss."row_number" < :number', {
            number: 4
          })
          .getRawMany()
      );
    }
    return {
      results: providerWithService,
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
      data.service_image = data?.service_image ? `${appConfig.appUrl}/images/service/${data.service_image}`: null 
      return omit(data, [
        'row_number',
        'provider_id',
        'company_name',
        'logo',
        'location',
        'city',
        'state',
        'landmark',
        'banner',
        'banner_link'
      ]);
    };
    return providerWithService.reduce(
      (
        prevValue: {
          company_name: string;
          provider_id: number;
          logo?: string;
          location?: string;
          city?: string;
          state?: string;
          landmark?: string;
          banner?: string;
          banner_link?: string;
          category_title: string;
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
            logo: currentValue.logo
              ? `${appConfig.appUrl}/images/logos/${currentValue.logo}`
              : null,
            city: currentValue.city,
            state: currentValue.state,
            landmark: currentValue.landmark,
            banner: currentValue.banner
              ? `${appConfig.appUrl}/images/provider-banners/${currentValue.banner}`
              : null,
            banner_link: currentValue.banner_link,
            category_title: currentValue.category_title,
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

  async searchProviderService(
    searchCategoryProvideServiceDto: SearchCategoryProvideServiceDto
  ) {
    const {
      categoryId,
      keywords,
      page = 1,
      limit = 4
    } = searchCategoryProvideServiceDto;
    const query = this.connection
      .createQueryBuilder(ServiceEntity, 'service')
      .leftJoin(UserEntity,'usr','usr.id = service."userId"')
      .leftJoin(CategoryEntity,'category','category.id = service."categoryId"')
      .leftJoin(
        'provider_informations',
        'provider',
        'provider.userId = service.userId'
      )
      .where(`usr.status = :userStatus`,{userStatus: 'active'})
      .andWhere(`category.status = :categoryStatus`,{categoryStatus: true})
      .andWhere('service.status = :status', {
        status: true
      });
  
    if (categoryId) {
      query.andWhere(`service.categoryId=:categoryId`, {
        categoryId
      });
    }
    if (keywords) {
      query.andWhere(`service.title Ilike :keywords OR provider."companyName" Ilike :keywords OR category.title Ilike :keywords`, {
        keywords: `%${keywords}%`
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
        'service.id as id',
        'service.title as title',
        'CAST(service.price as DOUBLE PRECISION) as price',
        'service.userId as provider_id',
        'service.durationInMinutes as duration_in_minutes',
        'service.description as description',
        'service.image as service_image',
        'service.scheduleType as "scheduleType"',
        'CAST(service.discount as DOUBLE PRECISION) as discount',
        'CAST(service.serviceCharge as DOUBLE PRECISION) as service_charge',
        'CAST((discount/100)*price as DOUBLE PRECISION) as discounted_amount',
        'CAST((price-((discount/100)*price)) as DOUBLE PRECISION) as amount_after_discount',
        'CAST((service."serviceCharge"/100)*(price-((discount/100)*price)) as DOUBLE PRECISION) as service_charge_amount',
        'CAST((price-((discount/100)*price))+(service."serviceCharge"/100)*(price-((discount/100)*price)) as DOUBLE PRECISION) as amount_after_service_charge',
        'provider.companyName as company_name',
        'provider.businessLogo as logo',
        'provider.businessLocation as location',
        'provider.city as city',
        'provider.state as state',
        'provider.landmark as landmark',
        'ROW_NUMBER() OVER (PARTITION BY service.userId)',
        'provider_banner.image as banner',
        'provider_banner.link as banner_link'
      ])
      .andWhere('service.userId In (:...users)', {
        users: [...categoryAssociatedProviders]
      })
      .leftJoin(
        (qb) =>
          qb
            .select([
              'banner.image as image',
              'banner.link as link',
              'banner.userId as userId'
            ])
            .from(ProviderBannerEntity, 'banner')
            .distinctOn(['banner."userId"'])
            .where('banner.userId In (:...users)', {
              users: [...categoryAssociatedProviders]
            })
            .andWhere('banner.status =:status', { status: true })
            .andWhere('banner.isFeatured =:status', { status: true })
            .orderBy('banner.createdAt', 'DESC')
            .orderBy('banner."userId"', 'ASC'),
        'provider_banner',
        'provider_banner.userId=service.userId'
      );

    let providerWithService = {};
    if (totalCategoryAssociatedProvidersCount.count > 0) {
      providerWithService = this.groupProviderWithService(
        await this.connection
          .createQueryBuilder()
          .from('(' + subQuery.getQuery() + ')', 'ss')
          .setParameters(subQuery.getParameters())
          .select('*')
          .andWhere('ss."row_number" < :number', {
            number: 4
          })
          .getRawMany()
      );
    }
    return {
      results: providerWithService,
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

  serviceBookings(serviceId: string) {
    return this.connection.manager
      .createQueryBuilder(BookingEntity, 'booking')
      .leftJoin('schedules', 'schedule', 'schedule.id = booking.scheduleId')
      .where(`schedule.serviceId = :serviceId`, { serviceId })
      .getMany();
  }
}
