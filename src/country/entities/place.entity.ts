import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { CityEntity } from './ city.entity';
import { CountryEntity } from './country.entity';

@Entity('places')
export class PlaceEntity extends CustomUuidBaseEntity {
  @Column('int')
  countryId: number;

  @Column('string')
  cityId: string;

  @Column('varchar')
  name: string;

  @Column('varchar')
  slug: string;

  @Column('boolean')
  status: boolean;

  @BeforeInsert()
  async generateSlugBeforeInsert() {
    if (this.name) {
      this.slug = slugify(this.name);
    }
  }

  @BeforeUpdate()
  async generateSlugBeforeUpdate() {
    if (this.name) {
      this.slug = slugify(this.name);
    }
  }

  @ManyToOne(() => CountryEntity, (country) => country.places)
  country: CountryEntity;

  @ManyToOne(() => CityEntity, (city) => city.places)
  city: CityEntity;
}
