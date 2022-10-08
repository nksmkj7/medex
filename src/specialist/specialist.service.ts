import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlinkSync } from 'fs';

import { NotFoundException } from 'src/exception/not-found.exception';

import { Pagination } from 'src/paginate';
import { SpecialistSerializer } from './serializer/specialist.serializer';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { SpecialistRepository } from './specialist.repository';
import { SpecialistFilterDto } from './dto/specialist-filter.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

@Injectable()
export class SpecialistService {
  constructor(
    @InjectRepository(SpecialistRepository)
    private repository: SpecialistRepository
  ) {}

  async create(
    createSpecialistDto: CreateSpecialistDto
  ): Promise<SpecialistSerializer> {
    return this.repository.store(createSpecialistDto);
  }

  async findAll(
    specialistFilterDto: SpecialistFilterDto
  ): Promise<Pagination<SpecialistSerializer>> {
    return this.repository.paginate(
      specialistFilterDto,
      [],
      [
        'fullName',
        'contactNo',
        'licenseRegistrationNumber',
        'educationTraining',
        'experienceExpertise',
        'publicAwards',
        'membershipActivities'
      ],
      {},
      { status: true }
    );
  }

  async findOne(id: string): Promise<SpecialistSerializer> {
    return this.repository.transform(await this.repository.findOne(id));
  }

  async update(
    id: string,
    updateSpecialistDto: UpdateSpecialistDto
  ): Promise<SpecialistSerializer> {
    const specialist = await this.repository.findOne(id);
    if (!specialist) {
      throw new NotFoundException();
    }
    if (specialist.image) {
      const path = `public/images/specialist/${specialist.image}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/specialist/${specialist.image}`);
      }
    }

    return this.repository.updateItem(specialist, updateSpecialistDto);
  }

  activeSpecialists() {
    return this.repository.find({
      where: {
        // status: true
      }
    });
  }
}
