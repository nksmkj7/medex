import { DeepPartial, EntityManager, EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { ProviderInformationEntity } from './entity/provider-information.entity';
import { ProviderSerializer } from './serializer/provider.serializer';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { NotFoundException } from '@nestjs/common';
import { ProviderBannerEntity } from './entity/provider-banner.entity';
import { ProviderBannerSerializer } from './serializer/provider-banner.serializer';

@EntityRepository(ProviderInformationEntity)
export class ProviderRepository extends BaseRepository<
  ProviderInformationEntity,
  ProviderSerializer
> {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {
    super();
  }
  /**
   * store new user
   * @param createUserDto
   * @param token
   */
  async store(
    createProviderDto: DeepPartial<ProviderInformationEntity>,
    manager?: EntityManager
  ) {
    manager = !manager ? this.manager : manager;
    const provider = manager.create(
      ProviderInformationEntity,
      createProviderDto
    );
    await manager.save(provider);
    return this.transform(provider);
  }

  /**
   * transform user
   * @param model
   * @param transformOption
   */
  transform(
    model: ProviderInformationEntity,
    transformOption = {}
  ): ProviderSerializer {
    return plainToClass(
      ProviderSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform users collection
   * @param models
   * @param transformOption
   */
  transformMany(
    models: ProviderInformationEntity[],
    transformOption = {}
  ): ProviderSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  async getProviderDetail(id: number, transformOptions = {}) {
    const user = await this.userRepository.findOne({
      relations: ['providerInformation', 'role'],
      where: {
        id,
        role: {
          name: 'provider'
        }
      }
    });
    if (!user) throw new NotFoundException();
    return this.userRepository.transform(user, { groups: ['admin'] });
  }

  transformProviderBanner(
    model: ProviderBannerEntity,
    transformOption = {}
  ): ProviderBannerSerializer {
    return plainToClass(
      ProviderBannerSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformManyProviderBanner(
    models: ProviderBannerEntity[],
    transformOption = {}
  ): ProviderBannerSerializer[] {
    return models.map((model) =>
      this.transformProviderBanner(model, transformOption)
    );
  }
}
