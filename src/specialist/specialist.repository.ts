import { EntityRepository } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { SpecialistEntity } from './entity/specialist.entity';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { SpecialistSerializer } from './serializer/specialist.serializer';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

@EntityRepository(SpecialistEntity)
export class SpecialRepository extends BaseRepository<
  SpecialistEntity,
  SpecialistSerializer
> {
  async store(
    createSpecialistDto: CreateSpecialistDto
  ): Promise<SpecialistSerializer> {
    const specialist = this.create(createSpecialistDto);
    await specialist.save();
    return this.transform(specialist);
  }

  async updateItem(
    specialist: SpecialistEntity,
    updateSpecialistDto: UpdateSpecialistDto
  ): Promise<SpecialistSerializer> {
    const updatedSpecialist = this.merge(specialist, updateSpecialistDto);
    await updatedSpecialist.save();
    updateSpecialistDto;
    return this.transform(updatedSpecialist);
  }

  transform(
    model: SpecialistEntity,
    transformOption = {}
  ): SpecialistSerializer {
    return plainToClass(
      SpecialistSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  transformMany(
    models: SpecialistEntity[],
    transformOption = {}
  ): SpecialistSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
