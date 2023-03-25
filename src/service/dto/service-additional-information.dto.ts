import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';

export class InfoDto {
  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @ValidateIf((object, value) => !!value)
  @IsOptional()
  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  show_in_box: boolean;
}

export default class ServiceAdditionalInformationDto {
  @ApiProperty({
    nullable: true,
    // isArray: true,
    //   type:
    properties: {
      icon: {
        type: 'string',
        example: 'apple.png'
      },
      key: {
        type: 'string',
        example: 'blood type'
      },
      value: {
        type: 'string',
        example: '<h1>Red</h1>'
      },
      show_in_box: {
        type: 'boolean',
        nullable: true,
        example: false
      }
    }
  })
  @ValidateIf((object, value) => {
    return !!value;
  })
  @ValidateNested()
  @ArrayNotEmpty()
  @Type(() => InfoDto)
  additionalInformation!: InfoDto[];
}
