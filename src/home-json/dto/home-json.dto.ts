import { Transform } from 'class-transformer';
import { isJSON, IsJSON, IsNotEmpty, Validate } from 'class-validator';
import { RunValidation } from 'src/common/validators/run-validation.validators';

export class HomeJsonDto {
  @IsNotEmpty()
  // @Transform(({ value }) => {
  //   console.log(value, 'value is --->');
  //   // if (typeof value !== 'string') return JSON.stringify(value);
  // })
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
  // @IsJSON()
  json: string;
}
