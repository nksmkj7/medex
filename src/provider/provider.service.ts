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
    private readonly authService: AuthService
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
    const {
      username,
      email,
      name,
      avatar,
      address,
      contact,
      ...providerInformation
    } = updateProviderDto;
    const updateUserDto: DeepPartial<UserEntity> = {
      username,
      email,
      name,
      address,
      contact,
      avatar
    };
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.update(UserEntity, id, updateUserDto);
      await manager.update(
        ProviderInformationEntity,
        { userId: user.id },
        providerInformation
      );
      await queryRunner.commitTransaction();
      return manager.merge(ProviderEntity, updateUserDto, providerInformation);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (updateUserDto.avatar && user.avatar) {
      const path = `public/images/profile/${user.avatar}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/profile/${user.avatar}`);
      }
    }
  }
}
