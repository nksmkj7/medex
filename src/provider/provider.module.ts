import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProviderService } from './provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { ProviderRepository } from './provider.repository';
import { RoleRepository } from 'src/role/role.repository';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderRepository]),
    TypeOrmModule.forFeature([UserRepository]),
    TypeOrmModule.forFeature([RoleRepository]),
    AuthModule,
    IsValidForeignKey
  ],
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository]
})
export class ProviderModule {}
