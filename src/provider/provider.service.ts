import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserSerializer } from 'src/auth/serializer/user.serializer';
import { UserRepository } from 'src/auth/user.repository';
import { Pagination } from 'src/paginate';
import { RoleRepository } from 'src/role/role.repository';
import { Connection, DeepPartial, EntityManager } from 'typeorm';
import { ProviderSearchFilterDto } from './dto/provider-search-filter.dto';
import { ProviderInformationEntity } from './entity/provider-information.entity';
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
    private readonly serviceRepository: ServiceRepository
  ) {}

  async registerUser(
    createUserDto: DeepPartial<UserEntity>,
    roleName = 'provider',
    token: string,
    manager?: EntityManager
  ): Promise<UserSerializer> {
    if (!createUserDto.status) {
      const role = await this.roleRepository.findBy('name', roleName);
      createUserDto.roleId = role.id;
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 1);
      createUserDto.tokenValidityDate = currentDateTime;
    }
    const user = await this.userRepository.store(createUserDto, token, manager);
    return user;
  }

  async createProvider(registerProviderDto: DeepPartial<ProviderEntity>) {
    const { username, email, password, name, ...providerInformation } =
      registerProviderDto;
    const createUserDto: DeepPartial<UserEntity> = {
      username,
      email,
      password,
      name
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

      const registerProcess = !createUserDto.status;

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

  async update(id: number, updateProviderDto: DeepPartial<ProviderEntity>) {
    const user = await this.userRepository.get(id, ['providerInformation'], {
      groups: [
        ...ownerUserGroupsForSerializing,
        ...adminUserGroupsForSerializing
      ]
    });

    // const updateUserDto: DeepPartial<UserEntity> = {
    //   username,
    //   email,
    //   name,
    //   address,
    //   contact,
    //   avatar
    // };
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      // await manager.update(UserEntity, id, updateUserDto);
      const provider = await manager.findOne(ProviderInformationEntity, {
        where: {
          userId: user.id
        }
      });
      await manager.update(
        ProviderInformationEntity,
        { userId: user.id },
        updateProviderDto
      );
      await queryRunner.commitTransaction();
      if (updateProviderDto.businessLogo && provider.businessLogo) {
        const path = `public/images/profile/${provider.businessLogo}`;
        if (existsSync(path)) {
          unlinkSync(`public/images/profile/${provider.businessLogo}`);
        }
      }
      return manager.merge(ProviderEntity, user, updateProviderDto);
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
    let user = await this.userRepository.findOne(id, {
      relations: ['providerInformation']
    });
    await this.connection
      .createQueryBuilder()
      .update(ProviderInformationEntity)
      .set({
        daySchedules: JSON.stringify(providerDayScheduleDto.daySchedules)
      })
      .where('userId=:id', { id: user.id })
      .execute();
    return providerDayScheduleDto;
  }

  async getDaySchedule(id: number) {
    let user = await this.userRepository.findOne(id, {
      relations: ['providerInformation']
    });
    const daySchedules: ProviderDayScheduleDto = JSON.parse(
      user.providerInformation.daySchedules
    );
    return daySchedules;
  }

  async providerCategories(id: number) {
    const user = await this.userRepository.findOneOrFail(id, {
      relations: ['role', 'services']
    });
    if (!user || user.role.name !== 'provider') {
      throw new BadRequestException('Invalid user or user is not a provider');
    }
    return this.serviceRepository.transformMany(user.services);
  }
}
