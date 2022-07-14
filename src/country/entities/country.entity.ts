import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity } from 'typeorm';

@Entity('countries')
export class CountryEntity extends CustomBaseEntity {
  @Column('varchar', { length: 150, nullable: false })
  name: string;

  @Column('varchar', { length: 10 })
  alphaCode: string;

  @Column('varchar', { length: 10 })
  alphaCode3: string;

  @Column('varchar', { array: true })
  alternateSpellings: string[];

  @Column('varchar', { array: true })
  callingCodes: string[];

  @Column('varchar', { array: true })
  currencies: string[];

  @Column('varchar', { array: true })
  languages: string[];

  @Column('varchar', { length: 200 })
  flag: string;
}
