import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerProfileImageDto {
  @ApiProperty({
    description: 'Customer Profile Image',
    type: 'string',
    format: 'binary'
  })
  @IsString()
  @IsNotEmpty()
  profilePicture: string;
}
