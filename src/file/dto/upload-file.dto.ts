import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Upload files',
    type: [String],
    format: 'binary'
  })
  @IsNotEmpty()
  files: string;

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
