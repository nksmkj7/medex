import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsJSON,
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
import { ScheduleTypeEnum } from '../enums/schedule-type.enum';

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
      message: 'Title has already been assigned to this user'
    }
  )
  title: string;

  @IsNotEmpty()
  @IsUUID()
  @Validate(IsValidForeignKey, [CategoryEntity])
  categoryId: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (!!value ? value : null))
  @ValidateIf((object, value) => {
    return value;
  })
  @IsUUID()
  @Validate(IsValidForeignKey, [CategoryEntity])
  subCategoryId: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Validate(IsValidForeignKey, [UserEntity])
  userId: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 0))
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  durationInMinutes: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 0))
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  @Max(100, { message: 'max-{"ln":"100","count":"100"}' })
  discount: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 0))
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  @Max(100, { message: 'max-{"ln":"100","count":"100"}' })
  serviceCharge: number;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  price: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (!!value ? value : null))
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(IsValidForeignKey, [SpecialistEntity], { each: true })
  specialistIds: string[];

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 0))
  @ValidateIf((object, value) => {
    return !!value;
  })
  @IsInt()
  @Min(0, { message: 'min-{"ln":"0","count":"0"}' })
  additionalTime: number;

  @ApiProperty()
  @IsTime('24h')
  @Validate(RunValidation, [isGreaterThanTime, 'endTime'], {
    message: 'startTime must be greater than endTime'
  })
  startTime: string;

  @ApiProperty()
  @IsTime('24h')
  @Validate(RunValidation, [isSmallerThanTime, 'startTime'], {
    message: 'endTime must be greater than startTime'
  })
  endTime: string;

  @ApiProperty({
    default: true
  })
  @IsNotEmpty()
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    default: ScheduleTypeEnum.SPEICIALIST_ONLY
  })
  @IsNotEmpty()
  @IsEnum(ScheduleTypeEnum)
  scheduleType: ScheduleTypeEnum;

  @ApiProperty({
    description: 'Service Image ',
    type: [String],
    format: 'binary'
  })
  @ValidateIf((object, value) => {
    return !!value;
  })
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shortDescription: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => !!value)
  @IsJSON()
  tags: string;

  @ApiPropertyOptional({
    type: 'string'
  })
  @IsOptional()
  @IsString()
  searchKeywords: string;
}
