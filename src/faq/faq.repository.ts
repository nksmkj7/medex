import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { FaqSerializer } from './serializer/faq.serializer';
import { FaqEntity } from './entity/faq.entity';
import { FaqDto } from './dto/faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@EntityRepository(FaqEntity)
export class FaqRepository extends BaseRepository<FaqEntity, FaqSerializer> {
  async store(faqDto: FaqDto): Promise<FaqSerializer> {
    const faq = this.create(faqDto);
    await faq.save();
    return this.transform(faq);
  }

  async updateItem(
    faq: FaqEntity,
    updateFaqDto: UpdateFaqDto
  ): Promise<FaqSerializer> {
    const updateFaq = this.merge(faq, updateFaqDto);
    await updateFaq.save();
    return this.transform(updateFaq);
  }

  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: FaqEntity, transformOption = {}): FaqSerializer {
    return plainToClass(
      FaqSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform array of roles
   * @param models
   * @param transformOption
   */
  transformMany(models: FaqEntity[], transformOption = {}): FaqSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
