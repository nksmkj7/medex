import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

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

  @OneToOne(() => ServiceEntity)
  @JoinColumn({
    name: 'serviceId',
    referencedColumnName: 'id'
  })
  service: ServiceEntity;
}
