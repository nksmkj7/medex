import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { FaqFilterDto } from './dto/faq-filter.dto';
import { FaqRepository } from './faq.repository';

import * as config from 'config';
import { FaqDto } from './dto/faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

const appConfig = config.get('app');

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FaqRepository) private readonly repository: FaqRepository
  ) {}
  getAllFaqs(faqFilterDto: FaqFilterDto, referer?: string) {
    let searchCriteria = {};
    if (referer == appConfig.frontendUrl) {
      searchCriteria['status'] = true;
    }
    return this.repository.paginate(
      faqFilterDto,
      [],
      ['question', 'answer'],
      {},
      searchCriteria
    );
  }

  store(faqDto: FaqDto) {
    return this.repository.store(faqDto);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    const faq = await this.repository.findOne(id);
    if (!faq) {
      throw new UnprocessableEntityException('Faq not found');
    }
    return this.repository.updateItem(faq, updateFaqDto);
  }

  async getFaqDetail(id: string) {
    const faq = await this.repository.findOne(id);
    if (!faq) {
      throw new UnprocessableEntityException('Faq not found');
    }
    return this.repository.transform(faq);
  }
}
