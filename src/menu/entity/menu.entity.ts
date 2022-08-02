import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique
} from 'typeorm';

@Entity({
  name: 'menus'
})
@Unique(['position', 'slug'])
@Unique(['slug'])
export class MenuEntity extends CustomBaseEntity {
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
  link: string;

  @Column('enum', {
    nullable: true,
    enum: ['direct', 'dropdown'],
    default: `'direct'`
  })
  menuType: string;

  @Column('boolean', {
    default: false
  })
  status: boolean;

  @Column('int', {
    nullable: true,
    unsigned: true
  })
  parentId: number | null;

  @ManyToOne((type) => MenuEntity, (menu) => menu.children)
  parent: MenuEntity;

  @OneToMany((type) => MenuEntity, (menu) => menu.parent)
  children: MenuEntity[];

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
