import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidateIf
} from 'class-validator';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { StaticPageEntity } from '../entity/static-page.entity';

export class StaticPageDto {
  @IsNotEmpty()
  @IsString()
  @Validate(
    UniqueValidatorPipe,
    [StaticPageEntity, [(value) => ({ slug: slugify(value) })]],
    {
      message: 'already taken'
    }
  )
  title: string;

  @ValidateIf((object, value) => !!value)
  @IsOptional()
  @IsString()
  content: string;
}
