import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf
} from 'class-validator';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CategoryEntity } from 'src/category/entity/category.entity';
import {
  isGreaterThanTime,
  isSmallerThanTime,
  slugify
} from 'src/common/helper/general.helper';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { IsTime } from 'src/common/validators/time-only.decorator';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { ServiceEntity } from '../entity/service.entity';
import * as dayjs from 'dayjs';

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

  @IsOptional()
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

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  durationInMinutes: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  @Max(100, { message: 'max-{"ln":"100","count":"100"}' })
  discount: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  @Max(100, { message: 'max-{"ln":"100","count":"100"}' })
  serviceCharge: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  price: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(IsValidForeignKey, [SpecialistEntity], { each: true })
  specialistIds: string[];

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  additionalTime: number;

  @IsOptional()
  @IsTime('24h')
  @Validate(RunValidation, [isGreaterThanTime, 'endTime'], {
    message: 'startTime must be greater than endTime'
  })
  startTime: string;

  @IsOptional()
  @IsTime('24h')
  @Validate(RunValidation, [isSmallerThanTime, 'startTime'], {
    message: 'endTime must be greater than startTime'
  })
  endTime: string;

  @ApiProperty({
    default: true
  })
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
