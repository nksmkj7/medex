import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({
  name: 'specialists'
})
@Unique(['licenseRegistrationNumber', 'licenseCountry'])
export class BannerEntity extends CustomBaseEntity {
  @Column('varchar')
  fullName: string;

  @Column('varchar')
  contactNo: string;

  @Column('varchar', {
    nullable: true
  })
  primarySpeciality: string;

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
}
