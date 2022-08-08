import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { CountryEntity } from 'src/country/entities/country.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('provider_informations')
export class ProviderInformationEntity extends CustomBaseEntity {
  @Column()
  userId: number;

  @OneToOne(() => UserEntity, (user) => user.providerInformation) // specify inverse side as a second parameter
  @JoinColumn()
  user: UserEntity;

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

  @OneToOne(() => CountryEntity)
  @JoinColumn()
  country: CountryEntity;

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

  @Column({
    nullable: true
  })
  businessDescription: string;

  @Column({
    nullable: true
  })
  vatNo: string;

  @Column()
  termsCondition: string;

  @Column({
    type: 'jsonb'
  })
  daySchedules: string;
}
