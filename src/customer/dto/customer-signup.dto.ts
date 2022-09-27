import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  Validate
} from 'class-validator';
import { IsEqualTo } from 'src/common/decorators/is-equal-to.decorator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { CustomerEntity } from '../entity/customer.entity';

export class CustomerSignupDto {
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  @Validate(UniqueValidatorPipe, [CustomerEntity], {
    message: 'already taken'
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'minLength-{"ln":6,"count":6}'
  })
  @MaxLength(20, {
    message: 'maxLength-{"ln":20,"count":20}'
  })
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/,
    {
      message:
        'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
    }
  )
  password: string;

  @IsNotEmpty()
  @IsEqualTo('password', {
    message: 'isEqualTo-{"field":"password"}'
  })
  confirmPassword: string;
}
