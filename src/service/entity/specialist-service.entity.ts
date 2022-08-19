import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { Column, Entity, JoinTable, OneToOne } from 'typeorm';
import { ServiceEntity } from './service.entity';

@Entity('service_specialist')
export class ServiceSpecialistEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  specialistId: string;

  @Column('varchar')
  serviceId: string;

  @Column('boolean', { default: true })
  status: boolean;

  @OneToOne(() => ServiceEntity)
  @JoinTable()
  service: ServiceEntity;

  @OneToOne(() => SpecialistEntity)
  @JoinTable()
  specialist: SpecialistEntity;
}
