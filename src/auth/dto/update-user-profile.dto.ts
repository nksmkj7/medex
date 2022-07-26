import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

/**
 * update user profile transfer object
 */
export class UpdateUserProfileDto extends OmitType(UpdateUserDto, [
  'status',
  'roleId',
  'avatar'
] as const) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  avatar: string;
}
