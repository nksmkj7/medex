import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator';

type deleteFileObj = { [index: string]: any };

export class DeleteFileDto {
  @IsNotEmpty()
  @IsString()
  tableName: string;

  @IsNotEmpty()
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({
    default: 'string',
    description: 'Default to string'
  })
  @IsOptional()
  @IsString()
  fieldType?: string;

  @IsNotEmpty()
  @IsObject()
  findOption: deleteFileObj;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
