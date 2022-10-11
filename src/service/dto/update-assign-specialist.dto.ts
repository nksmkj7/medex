import { OmitType } from '@nestjs/swagger';
import { AssignSpecialistDto } from './assign-specialist.dto';

export class UpdateAssignSpecialistDto extends OmitType(AssignSpecialistDto, [
  'specialistIds'
]) {}
