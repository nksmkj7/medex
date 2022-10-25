import { Transform } from 'class-transformer';
import { IsJSON, IsNotEmpty } from 'class-validator';

export class HomeJsonDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return JSON.stringify(value);
  })
  @IsJSON()
  json: string;
}
