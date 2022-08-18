import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  Validate,
  ValidateIf
} from 'class-validator';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CategoryEntity } from 'src/category/entity/category.entity';
import { slugify } from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { ServiceEntity } from '../entity/service.entity';

export class ServiceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  @Validate(
    UniqueValidatorPipe,
    [ServiceEntity, [(value: string) => ({ slug: slugify(value) }), 'userId']],
    {
      message: 'has already been assigned to this user'
    }
  )
  title: string;

  @IsNotEmpty()
  @IsUUID()
  @Validate(IsValidForeignKey, [CategoryEntity])
  categoryId: string;

  @ValidateIf((object, value) => {
    return value;
  })
  @IsUUID()
  @Validate(IsValidForeignKey, [CategoryEntity])
  subCategoryId: string;

  @IsNotEmpty()
  @IsInt()
  @Validate(IsValidForeignKey, [UserEntity])
  userId: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  durationInMinutes: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  discount: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  serviceCharge: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  price: number;

  @ApiProperty({
    default: true
  })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
