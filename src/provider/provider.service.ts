import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { RateLimiterStoreAbstract } from 'rate-limiter-flexible';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserRepository } from 'src/auth/user.repository';
import { MailService } from 'src/mail/mail.service';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { RoleRepository } from 'src/role/role.repository';
import { Connection, DeepPartial } from 'typeorm';
import { ProviderEntity } from './entity/provider.entity';

@Injectable()
export class ProviderService extends AuthService {
  constructor(
    @InjectRepository(UserRepository)
    userRepository: UserRepository,
    jwt: JwtService,
    mailService: MailService,
    refreshTokenService: RefreshTokenService,
    roleRepository: RoleRepository,
    @Inject('LOGIN_THROTTLE')
    rateLimiter: RateLimiterStoreAbstract,
    @InjectConnection()
    @InjectConnection()
    protected readonly connection: Connection
  ) {
    super(
      userRepository,
      jwt,
      mailService,
      refreshTokenService,
      roleRepository,
      rateLimiter
    );
  }
  async registerProvider(registerProviderDto: DeepPartial<ProviderEntity>) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { username, name, password, email }: DeepPartial<UserEntity> =
        registerProviderDto;
      const userDto: DeepPartial<UserEntity> = {
        username,
        name,
        password,
        email,
        roleId: 40
      };
      // const user = await this.create({ username, name, password, email });
      queryRunner.manager.queryRunner.manager.create(UserEntity, userDto);
      await queryRunner.commitTransaction();
      // console.log(user, 'asdfasdfasdf');
      // const provider = this.create(registerProviderDto);
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
