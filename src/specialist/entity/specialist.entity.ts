import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { CountryEntity } from 'src/country/entities/country.entity';
import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';

@Entity({
  name: 'specialists'
})
@Unique(['licenseRegistrationNumber', 'licenseCountry'])
export class SpecialistEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  fullName: string;

  @Column('varchar')
  contactNo: string;

  @Column('varchar', {
    nullable: true
  })
  primarySpecialty: string;

  @Column('varchar')
  image: string;

  @Column('text', {
    nullable: true
  })
  educationTraining: string;

  @Column('text', {
    nullable: true
  })
  experienceExpertise: string;

  @Column('text', {
    nullable: true
  })
  publicAwards: string;

  @Column('text', {
    nullable: true
  })
  membershipActivities: string;

  @Column('varchar', {
    nullable: false
  })
  licenseRegistrationNumber: string;

  @Column('int', {
    nullable: false,
    unsigned: true
  })
  licenseCountry: number;

  @Column('boolean', {
    default: true
  })
  status: boolean;

  @OneToOne(() => CountryEntity)
  @JoinColumn({
    name: 'licenseCountry',
    referencedColumnName: 'id'
  })
  country: CountryEntity;
}
