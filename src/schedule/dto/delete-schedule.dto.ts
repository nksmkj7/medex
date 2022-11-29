import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteScheduleDto {
  @IsNotEmpty()
  @IsUUID()
  specialistId: string;

  @IsNotEmpty()
  @IsUUID()
  serviceId: string;
}
