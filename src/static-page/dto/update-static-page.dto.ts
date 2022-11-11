import { OmitType } from '@nestjs/swagger';
import { StaticPageDto } from './static-page.dto';

export class UpdateStaticPageDto extends OmitType(StaticPageDto, ['title']) {}
