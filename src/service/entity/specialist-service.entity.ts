import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToOne } from 'typeorm';
import { ServiceEntity } from './service.entity';

@Entity('service_specialist')
export class ServiceSpecialistEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  specialistId: string;

  @Column('varchar')
  serviceId: string;

  @Column('boolean', { default: true })
  status: boolean;

  @Column('integer', { default: 0 })
  additionalTime: number;

  @Column('time', { nullable: true })
  startTime: string;

  @Column('time', { nullable: true })
  endTime: string;

  // @OneToOne(() => ServiceEntity)
  // @JoinTable()
  // service: ServiceEntity;

  // @OneToOne(() => SpecialistEntity)
  // @JoinTable()
  // specialist: SpecialistEntity;

  @ManyToOne(() => ServiceEntity, (service) => service.serviceSpecialists, {
    primary: true
  })
  public service!: ServiceEntity;

  @ManyToOne(
    () => SpecialistEntity,
    (specialist) => specialist.serviceSpecialists,
    { primary: true }
  )
  public specialist!: SpecialistEntity;
}
