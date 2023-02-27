import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { FileModule } from 'src/file/file.module';
import { SpecialistRepository } from 'src/specialist/specialist.repository';
import { ServiceController } from './service.controller';
import { ServiceRepository } from './service.repository';
import { ServiceService } from './service.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService],
  imports: [
    TypeOrmModule.forFeature([ServiceRepository, SpecialistRepository]),
    TypeOrmModule.forFeature([CategoryRepository]),
    TypeOrmModule.forFeature([UserRepository]),
    FileModule
  ],
  exports: [ServiceService]
})
export class ServiceModule {}
