import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAssetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString({
    each: true
  })
  destinationPath: string[];
}
