import { BookingEntity } from 'src/booking/entity/booking.entity';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { ServiceEntity } from 'src/service/entity/service.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

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

  @OneToOne(() => SpecialistEntity)
  @JoinColumn({
    name: 'specialistId',
    referencedColumnName: 'id'
  })
  specialist: SpecialistEntity;

  @OneToMany(() => BookingEntity, (booking) => booking.schedule)
  booking: BookingEntity;
}
