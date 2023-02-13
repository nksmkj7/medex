import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProviderService } from './provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { ProviderRepository } from './provider.repository';
import { RoleRepository } from 'src/role/role.repository';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { ServiceRepository } from 'src/service/service.repository';
import { CategoryRepository } from 'src/category/category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderRepository,
      ServiceRepository,
      CategoryRepository
    ]),
    TypeOrmModule.forFeature([UserRepository]),
    TypeOrmModule.forFeature([RoleRepository]),
    AuthModule,
    IsValidForeignKey
  ],
  controllers: [ProviderController],
  providers: [ProviderService, ProviderRepository],
  exports: [ProviderService]
})
export class ProviderModule {}
