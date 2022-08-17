import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';

import { NotFoundException } from 'src/exception/not-found.exception';

import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { Pagination } from 'src/paginate';
import { BannerSerializer } from './serializer/banner.serializer';
import { CreateBannerDto } from './dto/create-bannter.dto';
import { BannerRepository } from './banner.repository';
import { BannerFilterDto } from './dto/banner-filter.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService implements CommonServiceInterface<BannerSerializer> {
  constructor(
    @InjectRepository(BannerRepository)
    private repository: BannerRepository
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<BannerSerializer> {
    return this.repository.store(createBannerDto);
  }

  async findAll(
    bannerFilterDto: BannerFilterDto
  ): Promise<Pagination<BannerSerializer>> {
    return this.repository.paginate(
      bannerFilterDto,
      [],
      ['title', 'seoDescription', 'link']
    );
  }

  async findOne(id: number): Promise<BannerSerializer> {
    return this.repository.get(id);
  }

  async update(
    id: number,
    updateRoleDto: UpdateBannerDto
  ): Promise<BannerSerializer> {
    const banner = await this.repository.findOne(id);
    if (!banner) {
      throw new NotFoundException();
    }
    if (banner.image) {
      const path = `public/images/banner/${banner.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/banner/${banner.image}`);
      }
    }

    return this.repository.updateItem(banner, updateRoleDto);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    if (!banner) {
      if (!banner) {
        throw new NotFoundException();
      }
    }

    if (banner.image) {
      const path = `public/images/banner/${banner.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/banner/${banner.image}`);
      }
    }
    await this.repository.delete({ id });
  }
}
