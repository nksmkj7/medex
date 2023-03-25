import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CountryEntity } from './country.entity';

@Entity('operating_countries')
export class OperatingCountryEntity extends CustomBaseEntity {
  @Column('int')
  countryId: number;

  @Column('boolean', {
    default: true
  })
  status: boolean;

  @OneToOne(() => CountryEntity)
  @JoinColumn({
    name: 'countryId',
    referencedColumnName: 'id'
  })
  country: CountryEntity;
}
