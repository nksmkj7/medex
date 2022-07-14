import { DeepPartial, EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { ProviderInformationEntity } from './entity/provider-information.entity';
import { ProviderSerializer } from './serializer/provider.serializer';
import { ProviderEntity } from './entity/provider.entity';
import { BaseRepository } from 'src/common/repository/base.repository';

@EntityRepository(ProviderInformationEntity)
export class ProviderRepository extends BaseRepository<
  ProviderInformationEntity | ProviderEntity,
  ProviderSerializer
> {
  /**
   * store new user
   * @param createUserDto
   * @param token
   */
  async store(createProviderDto: DeepPartial<ProviderInformationEntity>) {
    // if (!createUserDto.status) {
    //   createUserDto.status = UserStatusEnum.INACTIVE;
    // }
    // createUserDto.salt = await bcrypt.genSalt();
    // createUserDto.token = token;
    // const user = this.create(createUserDto);
    // await user.save();
    // return this.transform(user);
  }

  /**
   * transform user
   * @param model
   * @param transformOption
   */
  transform(model: ProviderEntity, transformOption = {}): ProviderSerializer {
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
    models: ProviderEntity[],
    transformOption = {}
  ): ProviderSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
