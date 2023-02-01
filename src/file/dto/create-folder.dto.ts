import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Upload files'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'location to upload file'
  })
  @IsNotEmpty()
  @IsString({
    each: true
  })
  destinationPath: string[];
}
