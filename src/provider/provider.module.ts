import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProviderService } from './provider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { ProviderRepository } from './provider.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderRepository]),
    TypeOrmModule.forFeature([UserRepository]),
    AuthModule
  ],
  controllers: [ProviderController],
  providers: [ProviderService]
})
export class ProviderModule {}
