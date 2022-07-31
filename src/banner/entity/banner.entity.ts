import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({
  name: 'banners'
})
@Unique(['position'])
export class BannerEntity extends CustomBaseEntity {
  @Column('varchar')
  title: string;

  @Column('int', {
    unsigned: true
  })
  position: number;

  @Column('varchar')
  image: string;

  @Column('text', {
    nullable: true
  })
  seoDescription: string;

  @Column('varchar', {
    nullable: true
  })
  link: string;

  @Column('boolean', {
    default: true
  })
  status: boolean;
}
