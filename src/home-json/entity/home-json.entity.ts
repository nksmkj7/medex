import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import { CountryEntity } from 'src/country/entities/country.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne
} from 'typeorm';

@Entity('home_json')
export class HomeJsonEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  title: string;

  @Column('varchar')
  slug: string;

  @Column('int')
  position: number;

  @Column('varchar', {
    nullable: true
  })
  sectionIcon: string;

  @Column('date', {
    nullable: true
  })
  startDate: Date;

  @Column('date', {
    nullable: true
  })
  expiryDate: Date;

  @Column('int')
  countryId: number;

  @Column('varchar')
  moduleType: string;

  @Column('jsonb')
  content: { [index: string]: any };

  @OneToOne(() => CountryEntity)
  @JoinColumn({
    name: 'countryId',
    referencedColumnName: 'id'
  })
  country: CountryEntity;

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
}
