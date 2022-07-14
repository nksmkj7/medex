import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserRepository } from 'src/auth/user.repository';
import { Connection, DeepPartial } from 'typeorm';
import { ProviderInformationEntity } from './entity/provider-information.entity';
import { ProviderEntity } from './entity/provider.entity';
import { ProviderRepository } from './provider.repository';

@Injectable()
export class ProviderService {
  constructor(
    @InjectConnection()
    protected readonly connection: Connection,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(ProviderRepository)
    private readonly providerRepository: ProviderRepository,
    private readonly authService: AuthService
  ) {}

  // async create(
  //   createUserDto: DeepPartial<UserEntity>,
  //   roleName = 'admin'
  // ): Promise<UserSerializer> {
  //   const token = await this.generateUniqueToken(12);
  //   if (!createUserDto.status) {
  //     // createUserDto.roleId = 2;
  //     const role = await this.roleRepository.findBy('name', roleName);
  //     createUserDto.roleId = role.id;
  //     const currentDateTime = new Date();
  //     currentDateTime.setHours(currentDateTime.getHours() + 1);
  //     createUserDto.tokenValidityDate = currentDateTime;
  //   }
  //   const registerProcess = !createUserDto.status;
  //   const user = await this.userRepository.store(createUserDto, token);
  //   const subject = registerProcess ? 'Account created' : 'Set Password';
  //   const link = registerProcess ? `verify/${token}` : `reset/${token}`;
  //   const slug = registerProcess ? 'activate-account' : 'new-user-set-password';
  //   const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';
  //   await this.sendMailToUser(user, subject, link, slug, linkLabel);
  //   return user;
  // }

  async registerProvider(registerProviderDto: DeepPartial<ProviderEntity>) {
    const { username, email, password, name, ...providerInformation } =
      registerProviderDto;
    const createUserDto: DeepPartial<UserEntity> = {
      username,
      email,
      password,
      name
    };

    console.log(registerProviderDto, 'register provider dto is');
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      this.authService.transactionManager = manager;
      const user = await this.authService.create(createUserDto);
      if (user) {
        const provider = manager.create(ProviderInformationEntity, {
          ...providerInformation
        });
        await manager.save(provider);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    // try {
    //   const { username, name, password, email }: DeepPartial<UserEntity> =
    //     registerProviderDto;
    //   const userDto: DeepPartial<UserEntity> = {
    //     username,
    //     name,
    //     password,
    //     email,
    //     roleId: 40
    //   };
    //   // const user = await this.create({ username, name, password, email });
    //   queryRunner.manager.queryRunner.manager.create(UserEntity, userDto);
    //   await queryRunner.commitTransaction();
    //   // console.log(user, 'asdfasdfasdf');
    //   // const provider = this.create(registerProviderDto);
    // } catch (error) {
    //   console.log(error);
    //   await queryRunner.rollbackTransaction();
    // } finally {
    //   await queryRunner.release();
    // }
  }
}
