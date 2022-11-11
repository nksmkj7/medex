import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqController } from './faq.controller';
import { FaqRepository } from './faq.repository';
import { FaqService } from './faq.service';

@Module({
  controllers: [FaqController],
  providers: [FaqService],
  imports: [TypeOrmModule.forFeature([FaqRepository])]
})
export class FaqModule {}
