import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique
} from 'typeorm';

@Entity({
  name: 'categories'
})
@Unique(['position', 'slug'])
@Unique(['slug'])
export class CategoryEntity extends CustomBaseEntity {
  @Column('varchar')
  title: string;

  @Column('varchar')
  slug: string;

  @Column('int', {
    unsigned: true
  })
  position: number;

  @Column('varchar', {
    nullable: true
  })
  image: string;

  @Column('varchar', {
    nullable: true
  })
  color: string;

  @Column('text', {
    nullable: true
  })
  shortDescription: string;

  @Column('boolean', {
    default: false
  })
  status: boolean;

  @Column('boolean', {
    default: true
  })
  isNew: boolean;

  @Column('boolean', {
    default: false
  })
  isFeatured: boolean;

  @Column('uuid', {
    nullable: true
  })
  parentId: string | null;

  @ManyToOne(() => CategoryEntity, (menu) => menu.children)
  @JoinColumn({ name: 'parentId' })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, (menu) => menu.parent)
  @JoinColumn({ name: 'parentId' })
  children: CategoryEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async generateSlugBeforeInsert() {
    if (this.title) {
      this.slug = slugify(this.title);
    }
  }
}
