import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Upload files',
    type: [String],
    format: 'binary'
  })
  @IsNotEmpty()
  files: string;
}
