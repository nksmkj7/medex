import { CategoryEntity } from 'src/category/entity/category.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique
} from 'typeorm';
import { SpecialistEntity } from 'src/specialist/entity/specialist.entity';
import { ServiceSpecialistEntity } from './specialist-service.entity';
import { ScheduleTypeEnum } from '../enums/schedule-type.enum';

@Entity('services')
@Unique(['slug', 'userId'])
export class ServiceEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  title: string;

  @Column('varchar')
  slug: string;

  @Column('varchar')
  categoryId: string;

  @Column('varchar', { nullable: true })
  subCategoryId: string;

  @Column('int')
  userId: number;

  @Column('int', { default: 0 })
  durationInMinutes: number;

  @Column('text')
  description: string;

  @Column('decimal', { default: 0, precision: 4, scale: 4 })
  discount: number;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  serviceCharge: number;

  @Column('boolean', { default: false })
  status: boolean;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  price: number;

  @Column('integer', { default: 0 })
  additionalTime: number;

  @Column('time', { nullable: true })
  startTime: string;

  @Column('time', { nullable: true })
  endTime: string;

  @OneToOne(() => CategoryEntity)
  @JoinColumn()
  category: CategoryEntity;

  @OneToOne(() => CategoryEntity)
  @JoinColumn({
    name: 'subCategoryId',
    referencedColumnName: 'id'
  })
  subCategory: CategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.services)
  user: UserEntity;

  @ManyToMany(() => SpecialistEntity)
  @JoinTable({
    name: 'service_specialist',
    joinColumn: { name: 'serviceId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specialistId', referencedColumnName: 'id' }
  })
  specialists: SpecialistEntity[];

  @OneToMany(
    () => ServiceSpecialistEntity,
    (serviceSpecialistEntity) => serviceSpecialistEntity.service
  )
  serviceSpecialists!: ServiceSpecialistEntity[];

  @BeforeInsert()
  async generateSlugBeforeInsert() {
    if (this.title) {
      this.slug = slugify(this.title);
    }
  }

  @BeforeUpdate()
  async generateSlugBeforeUpdate() {
    if (this.title) {
      this.slug = slugify(this.title);
    }
  }

  discounted_amount: number;

  amount_after_discount: number;

  service_charge_amount: number;

  amount_after_service_charge: number;

  @AfterLoad()
  afterLoad() {
    this.discounted_amount = (this.discount / 100) * this.price;
    this.amount_after_discount = this.price - this.discounted_amount;
    this.service_charge_amount =
      (this.serviceCharge / 100) * this.amount_after_discount;
    this.amount_after_service_charge =
      this.amount_after_discount + this.service_charge_amount;
  }

  @Column('enum', {
    enum: [
      ScheduleTypeEnum.BOTH,
      ScheduleTypeEnum.SERVICE_ONLY,
      ScheduleTypeEnum.SPEICIALIST_ONLY
    ],
    default: ScheduleTypeEnum.SPEICIALIST_ONLY
  })
  scheduleType: string;
}
