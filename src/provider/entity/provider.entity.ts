import { UserEntity } from 'src/auth/entity/user.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ProviderEntity extends UserEntity {
  @Column()
  companyName: string;

  @Column()
  phone1: string;

  @Column({
    nullable: true
  })
  phone2: string;

  @Column()
  startDate: Date;

  @Column('int')
  countryId: number;

  @Column({
    nullable: true
  })
  city: string;

  @Column({
    nullable: true
  })
  state: string;

  @Column({
    nullable: true
  })
  landmark: string;

  @Column({
    nullable: true
  })
  timezone: string;

  @Column({
    nullable: true
  })
  currency: string;

  @Column({
    nullable: true
  })
  contactPerson: string;

  @Column({
    nullable: true
  })
  serviceArea: string;

  @Column({
    nullable: true
  })
  businessLocation: string;

  @Column({
    nullable: true
  })
  businessLogo: string;

  @Column('text', {
    nullable: true
  })
  businessDescription: string;

  @Column({
    nullable: true
  })
  vatNo: string;

  @Column('text', {})
  termsCondition: string;
}
