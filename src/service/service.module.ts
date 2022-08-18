import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { ServiceService } from './service.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService],
  imports: [
    TypeOrmModule.forFeature([ServiceRepository]),
    TypeOrmModule.forFeature([CategoryRepository]),
    TypeOrmModule.forFeature([UserRepository])
  ]
})
export class ServiceModule {}
