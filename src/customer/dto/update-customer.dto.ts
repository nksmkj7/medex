import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { IndexEnumStatus } from 'src/common/helper/enum.helper';

export class UpdateCustomerDto {
  @IsNotEmpty()
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;
}
