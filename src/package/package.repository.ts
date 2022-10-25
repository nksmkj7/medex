import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { PackageEntity } from './entity/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackageSerializer } from './serializer/package.serializer';
import { UpdatePackageDto } from './dto/update-package.dto';

@EntityRepository(PackageEntity)
export class PackageRepository extends BaseRepository<
  PackageEntity,
  PackageSerializer
> {
  async store(createPackageDto: CreatePackageDto): Promise<PackageSerializer> {
    const pkg = this.create(createPackageDto);
    await pkg.save();
    return this.transform(pkg);
  }

  async updateItem(
    pkg: PackageEntity,
    updatePackageDto: UpdatePackageDto
  ): Promise<PackageSerializer> {
    const updatedPackage = this.merge(pkg, updatePackageDto);
    await updatedPackage.save();
    return this.transform(updatedPackage);
  }

  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: PackageEntity, transformOption = {}): PackageSerializer {
    return plainToClass(
      PackageSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform array of roles
   * @param models
   * @param transformOption
   */
  transformMany(
    models: PackageEntity[],
    transformOption = {}
  ): PackageSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
