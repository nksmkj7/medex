import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';

import { NotFoundException } from 'src/exception/not-found.exception';

import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { Pagination } from 'src/paginate';
import { PackageSerializer } from './serializer/package.serializer';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackageRepository } from './package.repository';
import { PackageFilterDto } from './dto/package-filter.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackageService
  implements CommonServiceInterface<PackageSerializer>
{
  constructor(
    @InjectRepository(PackageRepository)
    private repository: PackageRepository
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<PackageSerializer> {
    return this.repository.store(createPackageDto);
  }

  async findAll(
    packageFilterDto: PackageFilterDto
  ): Promise<Pagination<PackageSerializer>> {
    return this.repository.paginate(
      packageFilterDto,
      [],
      ['title', 'seoDescription', 'link']
    );
  }

  async findOne(id: number): Promise<PackageSerializer> {
    return this.repository.get(id);
  }

  async update(
    id: number,
    updatePackageDto: UpdatePackageDto,
    file?: Express.Multer.File
  ): Promise<PackageSerializer> {
    const pkg = await this.repository.findOne(id);
    if (!pkg) {
      throw new NotFoundException();
    }
    updatePackageDto = file
      ? { ...updatePackageDto, image: file.filename }
      : { ...updatePackageDto, image: pkg.image };
    if (pkg.image && file) {
      const path = `public/images/package/${pkg.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/package/${pkg.image}`);
      }
    }

    return this.repository.updateItem(pkg, updatePackageDto);
  }

  async remove(id: number): Promise<void> {
    const pkg = await this.findOne(id);
    if (!pkg) {
      if (!pkg) {
        throw new NotFoundException();
      }
    }

    if (pkg.image) {
      const path = `public/images/package/${pkg.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/package/${pkg.image}`);
      }
    }
    await this.repository.delete({ id });
  }
}
