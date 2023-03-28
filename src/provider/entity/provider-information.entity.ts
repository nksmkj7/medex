import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { CityEntity } from 'src/country/entities/ city.entity';
import { CountryEntity } from 'src/country/entities/country.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

export interface IDaySchedules {
  sunday?: {
    startTime: string;
    endTime: string;
  };
  monday?: {
    startTime: string;
    endTime: string;
  };
  tuesday?: {
    startTime: string;
    endTime: string;
  };
  wednesday?: {
    startTime: string;
    endTime: string;
  };
  thursday?: {
    startTime: string;
    endTime: string;
  };
  friday?: {
    startTime: string;
    endTime: string;
  };
  saturday?: {
    startTime: string;
    endTime: string;
  };
}

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

  @OneToOne(() => CityEntity)
  @JoinColumn()
  city: CityEntity;

  @Column('varchar')
  cityId: string;

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
  daySchedules: IDaySchedules;

  @Column({
    type: 'decimal',
    nullable: true
  })
  latitude: number;

  @Column({
    type: 'decimal',
    nullable: true
  })
  longitude: number;

  @Column({
    type: 'varchar',
    nullable: true
  })
  showEmail: string;
}
