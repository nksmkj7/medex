import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { BannerEntity } from './entity/specialist.entity';
import { CreateBannerDto } from './dto/create-bannter.dto';
import { BannerSerializer } from './serializer/banner.serializer';
import { UpdateBannerDto } from './dto/update-banner.dto';

@EntityRepository(BannerEntity)
export class BannerRepository extends BaseRepository<
  BannerEntity,
  BannerSerializer
> {
  async store(createBannerDto: CreateBannerDto): Promise<BannerSerializer> {
    const banner = this.create(createBannerDto);
    await banner.save();
    return this.transform(banner);
  }

  async updateItem(
    banner: BannerEntity,
    updateBannerDto: UpdateBannerDto
  ): Promise<BannerSerializer> {
    const updatedBanner = this.merge(banner, updateBannerDto);
    await updatedBanner.save();
    return this.transform(updatedBanner);
  }

  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: BannerEntity, transformOption = {}): BannerSerializer {
    return plainToClass(
      BannerSerializer,
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
    models: BannerEntity[],
    transformOption = {}
  ): BannerSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
