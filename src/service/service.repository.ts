import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { NotFoundException } from '@nestjs/common';
import { ServiceEntity } from './entity/service.entity';
import { ServiceSerializer } from './service.serializer';
import { ServiceDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@EntityRepository(ServiceEntity)
export class ServiceRepository extends BaseRepository<
  ServiceEntity,
  ServiceSerializer
> {
  async store(createServiceDto: ServiceDto): Promise<ServiceSerializer> {
    const service = this.create(createServiceDto);
    await service.save();
    return this.transform(service);
  }

  async updateItem(
    service: ServiceEntity,
    updateServiceDto: UpdateServiceDto
  ): Promise<ServiceSerializer> {
    const updatedService = this.merge(service, updateServiceDto);
    await updatedService.save();
    return this.transform(updatedService);
  }

  transform(model: ServiceEntity, transformOption = {}): ServiceSerializer {
    return plainToClass(
      ServiceSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: ServiceEntity[],
    transformOption = {}
  ): ServiceSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
