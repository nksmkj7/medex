import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { Column, Entity } from 'typeorm';
import { IBackOfficeResponse } from '../backoffice.processor';

@Entity('back_office_logs')
export class BackOfficeLogEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  bookingId: string;

  @Column('jsonb')
  backOfficeResponse: IBackOfficeResponse;

  @Column('boolean')
  status: boolean;
}
