import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min, Validate } from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { SpecialistEntity } from '../entity/specialist.entity';
import { SpecialistDto } from './specialist.dto';

export class UpdateSpecialistDto extends OmitType(SpecialistDto, ['image']) {
  @ApiPropertyOptional({
    description: 'Specialist Profile Image ',
    type: 'string',
    format: 'binary'
  })
  image: string;
}
