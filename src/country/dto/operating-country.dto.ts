import { IsNotEmpty, IsNumber } from 'class-validator';

export class OperatingCountryDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  countryId: number[];
}
