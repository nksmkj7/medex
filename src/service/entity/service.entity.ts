import { CategoryEntity } from 'src/category/entity/category.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { slugify } from 'src/common/helper/general.helper';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  Unique
} from 'typeorm';

@Entity('services')
@Unique(['slug', 'userId'])
export class ServiceEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  title: string;

  @Column('varchar')
  slug: string;

  @Column('varchar')
  categoryId: string;

  @Column('varchar', { nullable: true })
  subCategoryId: string;

  @Column('int')
  userId: number;

  @Column('int', { default: 0 })
  durationInMinutes: number;

  @Column('text')
  description: string;

  @Column('decimal', { default: 0, precision: 4, scale: 4 })
  discount: number;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  serviceCharge: number;

  @Column('boolean', { default: false })
  status: boolean;

  @Column('decimal', { default: 0, precision: 12, scale: 4 })
  price: number;

  @OneToOne(() => CategoryEntity)
  @JoinColumn()
  category: CategoryEntity;

  @OneToOne(() => CategoryEntity)
  @JoinColumn({
    name: 'subCategoryId',
    referencedColumnName: 'id'
  })
  subCategory: CategoryEntity;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

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
