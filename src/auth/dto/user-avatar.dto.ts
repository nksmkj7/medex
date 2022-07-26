import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserAvatarDto {
  @ApiProperty({
    description: 'User avatar',
    type: 'string',
    format: 'binary'
  })
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
