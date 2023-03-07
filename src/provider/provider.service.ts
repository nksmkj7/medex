import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { UserRepository } from 'src/auth/user.repository';
import { Pagination } from 'src/paginate';
import { RoleRepository } from 'src/role/role.repository';
import {
  Connection,
  DeepPartial,
  EntityManager,
  FindOperator,
  In
} from 'typeorm';
import { ProviderSearchFilterDto } from './dto/provider-search-filter.dto';
import {
  ProviderInformationEntity,
  IDaySchedules
} from './entity/provider-information.entity';
import { ProviderEntity } from './entity/provider.entity';
import { ProviderRepository } from './provider.repository';
import {
  adminUserGroupsForSerializing,
  defaultUserGroupsForSerializing,
  ownerUserGroupsForSerializing
} from 'src/auth/serializer/user.serializer';
import { existsSync, unlinkSync } from 'fs';
import { ProviderDayScheduleDto } from './dto/provider-day-schedule.dto';
import { ServiceRepository } from 'src/service/service.repository';
import { weekDays } from 'src/common/constants/weekdays.constants';
import { NotFoundException } from 'src/exception/not-found.exception';
import { ProviderBannerDto } from './dto/provider-banner.dto';
import { ProviderBannerEntity } from './entity/provider-banner.entity';
import { UpdateProviderBannerDto } from './dto/update-provider-banner.dto';

import * as config from 'config';
import { ServiceFilterDtoWithoutProvider } from './provider.controller';
import { CategoryRepository } from 'src/category/category.repository';
import { CategoryFilterDto } from 'src/category/dto/category-filter.dto';
import { ProviderCategoryFilterDto } from './dto/provider-category-filter.dto';
import { ProviderCategorywiseServiceDto } from './dto/provider-categorywise-service.dto';
import { UserStatusEnum } from 'src/auth/user-status.enum';

const appConfig = config.get('app');

@Injectable()
export class ProviderService {
  constructor(
    @InjectConnection()
    protected readonly connection: Connection,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(ProviderRepository)
    private readonly providerRepository: ProviderRepository,
    @InjectRepository(RoleRepository)
    private readonly roleRepository: RoleRepository,
    private readonly authService: AuthService,
    @InjectRepository(ServiceRepository)
    private readonly serviceRepository: ServiceRepository,
    @InjectRepository(CategoryRepository)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async registerUser(
    createUserDto: DeepPartial<UserEntity>,
    roleName = 'provider',
    token: string,
    manager?: EntityManager
  ): Promise<UserSerializer> {
    // if (!createUserDto?.status || ) {
    const role = await this.roleRepository.findBy('name', roleName);
    createUserDto.roleId = role.id;
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);
    createUserDto.tokenValidityDate = currentDateTime;
    // }
    const user = await this.userRepository.store(createUserDto, token, manager);
    return user;
  }

  async createProvider(registerProviderDto: DeepPartial<ProviderEntity>) {
    const { username, email, password, name, status, ...providerInformation } =
      registerProviderDto;
    const createUserDto: DeepPartial<UserEntity> = {
      username,
      email,
      password,
      name,
      status
    };
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      this.authService.transactionManager = manager;
      const token = await this.authService.generateUniqueToken(12);
      const user = await this.registerUser(
        createUserDto,
        'provider',
        token,
        manager
      );
      if (!user) throw new BadRequestException();
      const provider = await this.providerRepository.store(
        {
          ...providerInformation,
          userId: user.id
        },
        manager
      );

      // const registerProcess = !createUserDto.status;
      const registerProcess =
        createUserDto?.status && createUserDto.status === 'active'
          ? false
          : true;

      const subject = registerProcess ? 'Account created' : 'Set Password';
      const link = registerProcess ? `verify/${token}` : `reset/${token}`;
      const slug = registerProcess
        ? 'activate-account'
        : 'new-user-set-password';
      const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';
      await this.authService.sendMailToUser(
        user,
        subject,
        link,
        slug,
        linkLabel
      );
      await queryRunner.commitTransaction();
      return provider;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getProviderDetail(id: number) {
    return await this.providerRepository.getProviderDetail(id);
  }

  async getProviderList(
    providerSearchFilterDto: ProviderSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.userRepository.paginate(
      providerSearchFilterDto,
      ['providerInformation', 'role'],
      ['username', 'email', 'name', 'contact', 'address'],
      {
        groups: [
          ...adminUserGroupsForSerializing,
          ...ownerUserGroupsForSerializing,
          ...defaultUserGroupsForSerializing
        ]
      },
      {
        role: {
          name: 'provider'
        }
      }
    );
  }

  async update(
    id: number,
    updateProviderDto: DeepPartial<ProviderEntity>,
    file: Express.Multer.File
  ) {
    let { username, email, name, status, ...providerDto } = updateProviderDto;
    const user = await this.userRepository.get(id, ['providerInformation'], {
      groups: [
        ...ownerUserGroupsForSerializing,
        ...adminUserGroupsForSerializing
      ]
    });

    const updateUserDto: DeepPartial<UserEntity> = {
      username,
      email,
      name,
      status
    };
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.update(UserEntity, id, updateUserDto);
      const provider = await manager.findOne(ProviderInformationEntity, {
        where: {
          userId: user.id
        }
      });
      const previousFile = provider.businessLogo;
      providerDto = Object.keys(file).length
        ? { ...providerDto, businessLogo: file.filename }
        : {
            ...providerDto,
            businessLogo: previousFile
          };
      await manager.update(
        ProviderInformationEntity,
        { userId: user.id },
        providerDto
      );
      await queryRunner.commitTransaction();
      if (providerDto.businessLogo && !!Object.keys(file).length) {
        const path = `public/images/profile/${previousFile}`;
        if (existsSync(path)) {
          unlinkSync(`public/images/profile/${previousFile}`);
        }
      }

      return manager.merge(ProviderEntity, user, providerDto);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addDaySchedule(
    id: number,
    providerDayScheduleDto: ProviderDayScheduleDto
  ) {
    const user = await this.userRepository.findOne(id, {
      relations: ['providerInformation']
    });
    await this.connection
      .createQueryBuilder()
      .update(ProviderInformationEntity)
      .set({
        daySchedules: providerDayScheduleDto.daySchedules
      })
      .where('userId=:id', { id: user.id })
      .execute();
    return providerDayScheduleDto;
  }

  async getDaySchedule(id: number): Promise<IDaySchedules> {
    const user = await this.userRepository.findOne(id, {
      relations: ['providerInformation']
    });
    const daySchedules = user.providerInformation.daySchedules;
    if (!daySchedules) {
      throw new NotFoundException('Provider weekly day schedule not found.');
    }
    return weekDays.reduce((accumulator, currentValue) => {
      if (
        daySchedules[currentValue] &&
        daySchedules[currentValue].startTime &&
        daySchedules[currentValue].endTime
      ) {
        accumulator[currentValue] = daySchedules[currentValue];
      }
      return accumulator;
    }, {});
  }

  async providerServices(
    id: number,
    serviceFilterDto: ServiceFilterDtoWithoutProvider,
    referer?: string
  ) {
    const searchCondition = {};
    if (referer !== appConfig.frontendUrl + '/') {
      searchCondition['status'] = true;
    }
    const user = await this.userRepository.findOne(id, {
      relations: ['role']
    });
    if (!user || user.role.name !== 'provider') {
      throw new BadRequestException('Invalid user or user is not a provider');
    }
    searchCondition['userId'] = id;
    return this.serviceRepository.paginate(
      serviceFilterDto,
      [],
      ['title'],
      {},
      searchCondition
    );
  }

  async providerWeekHolidays(id: number) {
    const daySchedules = (await this.getDaySchedule(id)) ?? [];
    const weekDaysSchedules = Object.keys(daySchedules);
    return weekDays.filter((weekDay) => !weekDaysSchedules.includes(weekDay));
  }

  async dayStartEndTime(id: number, day: string) {
    const user = await this.connection.manager
      .createQueryBuilder(ProviderInformationEntity, 'provider')
      .where('provider.userId=:id', { id })
      .select(`provider.daySchedules ::json->'${day}' as schedule`)
      .getRawOne();
    if (!user?.schedule) {
      throw new NotFoundException('Schedule not found.');
    }
    return user.schedule;
  }

  async activeProviders() {
    const providers = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.name',
        'providerInformation.companyName'
      ])
      .where('user.status = :status', { status: UserStatusEnum.ACTIVE })
      .innerJoin('user.providerInformation', 'providerInformation')
      .innerJoin('user.role', 'role', 'role.name=:roleName', {
        roleName: 'provider'
      })
      .getMany();
    return this.userRepository.transformMany(providers, {
      groups: [
        ...adminUserGroupsForSerializing,
        ...ownerUserGroupsForSerializing,
        ...defaultUserGroupsForSerializing
      ]
    });
  }

  async saveBanner(
    id: number,
    providerBannerDto: ProviderBannerDto,
    file: Express.Multer.File
  ) {
    const provider = await this.userRepository.get(id, ['role'], {
      groups: [...ownerUserGroupsForSerializing]
    });
    if (!provider || provider.role.name !== 'provider') {
      throw new BadRequestException('Provider not found');
    }
    const banner = this.connection.manager.create(ProviderBannerEntity, {
      userId: id,
      image: file.filename,
      status:
        (providerBannerDto.status as unknown as string) === 'false'
          ? false
          : true,
      link: providerBannerDto.link,
      isFeatured:
        (providerBannerDto.isFeatured as unknown as string) === 'false'
          ? false
          : true
    });
    await banner.save();
    return this.providerRepository.transformProviderBanner(banner);
  }

  async providerBanners(id: number, findOptions = {}) {
    const banners = await this.connection.manager.find(ProviderBannerEntity, {
      where: {
        userId: id,
        ...findOptions
      }
    });
    return this.providerRepository.transformManyProviderBanner(banners);
  }

  async removeProviderBanner(id: number, bannerId: string) {
    const banner = await this.connection.manager.findOneOrFail(
      ProviderBannerEntity,
      {
        where: {
          userId: id,
          id: bannerId
        }
      }
    );
    if (banner.image) {
      const path = `public/images/provider-banners/${banner.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/provider-banners/${banner.image}`);
      }
    }
    return banner.remove();
  }

  async updateProviderBanner(
    id: number,
    bannerId: string,
    updateProviderBannerDto: UpdateProviderBannerDto,
    file: Express.Multer.File
  ) {
    const { link, status, isFeatured } = updateProviderBannerDto;
    const banner = await this.connection.manager.findOneOrFail(
      ProviderBannerEntity,
      {
        where: {
          userId: id,
          id: bannerId
        }
      }
    );
    banner.link = link;
    banner.status = status;
    banner.isFeatured = isFeatured;
    if (file) {
      if (banner.image) {
        const path = `public/images/provider-banners/${banner.image}`;
        if (existsSync(path)) {
          unlinkSync(`public/images/provider-banners/${banner.image}`);
        }
      }
      banner.image = file.filename;
    }
    await banner.save();
    return this.providerRepository.transformProviderBanner(banner);
  }

  async getProviderBanner(id: number, bannerId: string) {
    const banner = await this.connection.manager.findOneOrFail(
      ProviderBannerEntity,
      {
        where: {
          userId: id,
          id: bannerId
        }
      }
    );
    return this.providerRepository.transformProviderBanner(banner);
  }

  async getProviderCategories(providerId: number) {
    const providerCategoriesIds = await this.serviceRepository
      .createQueryBuilder('service')
      .where(`service."userId" = :providerId`, { providerId })
      .select(['service."categoryId"', 'service."subCategoryId"'])
      .distinctOn(['service."categoryId"', 'service."subCategoryId"'])
      .getRawMany();
    const categories = providerCategoriesIds.length
      ? providerCategoriesIds.reduce((accumulator, currentCategory) => {
          if (currentCategory.subCategoryId) {
            accumulator.push(currentCategory.subCategoryId);
          }
          return [...accumulator, currentCategory.categoryId];
        }, [])
      : [];

    const results = await this.categoryRepository
      .createQueryBuilder('category')
      .where(`category.id IN (:...categories)`, { categories })
      .andWhere(`status = :status`, { status: true })
      .getRawMany();
    const finalResults = [];
    providerCategoriesIds.forEach((category) => {
      if (!finalResults.length) {
        finalResults.push({
          ...results.find(
            (result) => result.category_id === category.categoryId
          ),
          category_subCategories: category.subCategoryId
            ? [
                results.find(
                  (result) => result.category_id === category.subCategoryId
                )
              ]
            : []
        });
      } else {
        const resultCategory = finalResults.find(
          (finalCategory) => finalCategory.category_id === category.categoryId
        );
        if (!resultCategory) {
          finalResults.push({
            ...results.find(
              (result) => result.category_id === category.categoryId
            ),
            category_subCategories: category.subCategoryId
              ? [
                  results.find(
                    (result) => result.category_id === category.subCategoryId
                  )
                ]
              : []
          });
        }
        if (category.subCategoryId && resultCategory) {
          resultCategory['category_subCategories'].push(
            finalResults.find(
              (finalCategory) =>
                finalCategory.category_id === category.subCategoryId
            )
          );
        }
      }
    });
    return finalResults;
  }

  async getProviderCategoryServices(
    providerId: number,
    categoryId: string,
    providerCategorywiseServiceDto: ProviderCategorywiseServiceDto
  ) {
    // eslint-disable-next-line prefer-const
    let { limit, page, subCategoryId } = providerCategorywiseServiceDto;
    if (!subCategoryId) {
      subCategoryId = null;
    }
    return this.serviceRepository.paginate(
      { limit, page },
      [],
      [],
      {},
      {
        userId: providerId,
        categoryId: categoryId,
        subCategoryId
      }
    );
  }

  async getProviderDetailByUsername(username: string) {
    const user = await this.userRepository.findOne({
      relations: ['providerInformation', 'role', 'providerInformation.country'],
      where: {
        username,
        role: {
          name: 'provider'
        }
      }
    });
    if (!user) throw new NotFoundException();
    return this.userRepository.transform(user, { groups: ['admin'] });
  }
}
