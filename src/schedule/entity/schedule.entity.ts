import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { Column, Entity } from 'typeorm';

export interface ISchedule {
  id: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

@Entity('schedules')
export class ScheduleEntity extends CustomUuidBaseEntity {
  @Column('varchar', {
    nullable: false
  })
  serviceId: string;

  @Column('varchar', {
    nullable: false
  })
  specialistId: string;

  @Column('date', {
    nullable: false
  })
  date: Date;

  @Column('jsonb', {
    nullable: false
  })
  schedules: ISchedule[];
}
