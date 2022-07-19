import { IsEmail, IsEmpty, IsIn, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserStatusEnum } from 'src/auth/user-status.enum';

const statusEnumArray = [
  UserStatusEnum.ACTIVE,
  UserStatusEnum.INACTIVE,
  UserStatusEnum.BLOCKED
];
/**
 * update user data transfer object
 */
export class UpdateUserDto {
  @IsEmpty()
  @IsString()
  username: string;

  @IsEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  contact: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsIn(statusEnumArray, {
    message: `isIn-{"items":"${statusEnumArray.join(',')}"}`
  })
  status: UserStatusEnum;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  roleId: number;
}
