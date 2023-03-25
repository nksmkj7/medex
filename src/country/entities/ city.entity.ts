import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { CountryEntity } from './country.entity';
import { PlaceEntity } from './place.entity';

@Entity('cities')
export class CityEntity extends CustomUuidBaseEntity {
  @Column('int')
  countryId: number;

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

  @ManyToOne(() => CountryEntity, (country) => country.cities)
  country: CountryEntity;

  @OneToMany(() => PlaceEntity, (place) => place.city)
  places: PlaceEntity[];
}
