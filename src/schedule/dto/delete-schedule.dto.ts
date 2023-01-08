import { IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class DeleteScheduleDto {
  @ValidateIf((object,value) => !!value)
  @IsOptional()
  @IsUUID()
  specialistId: string;

  @IsNotEmpty()
  @IsUUID()
  serviceId: string;
  
}
