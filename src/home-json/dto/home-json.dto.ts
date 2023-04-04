import { Transform } from 'class-transformer';
import {
  IsDateString,
  isJSON,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate
} from 'class-validator';
import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { IsValidForeignKey } from 'src/common/validators/is-valid-foreign-key.validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';
import { CountryEntity } from 'src/country/entities/country.entity';
import { ObjectLiteral } from 'typeorm';
import { HomeJsonEntity } from '../entity/home-json.entity';

export class HomeJsonDto {
  // @IsNotEmpty()
  // @Validate(
  //   RunValidation,
  //   [
  //     (value: string) => {
  //       let jsonString = '{}';
  //       if (typeof value !== 'string') {
  //         jsonString = JSON.stringify(value);
  //       }
  //       return isJSON(JSON.stringify(value));
  //     }
  //   ],
  //   {
  //     message: 'invalid json'
  //   }
  // )
  // json: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, {
    message: 'min-{"ln":"1"}'
  })
  @Validate(UniqueValidatorPipe, [HomeJsonEntity, 'position'], {
    message: 'already taken'
  })
  position: number;

  @IsOptional()
  sectionIcon: string;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate: string;

  @IsNotEmpty()
  @Validate(IsValidForeignKey, [CountryEntity])
  countryId: number;

  @IsNotEmpty()
  @IsString()
  moduleType: string;

  @IsNotEmpty()
  @Validate(
    RunValidation,
    [
      (value: string) => {
        let jsonString = '{}';
        if (typeof value !== 'string') {
          jsonString = JSON.stringify(value);
        }
        return isJSON(JSON.stringify(value));
      }
    ],
    {
      message: 'invalid json'
    }
  )
  content: ObjectLiteral;
}
