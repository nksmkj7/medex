import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'provider_banners'
})
export class ProviderBannerEntity extends CustomBaseEntity {
  @Column('int', {
    nullable: false,
    unsigned: true
  })
  userId: number;

  @Column('varchar', {
    nullable: false
  })
  image: string;

  @Column('varchar', {
    nullable: true
  })
  link: string;

  @Column('boolean', {
    default: true
  })
  status: boolean;

  @Column('boolean', {
    default: true
  })
  isFeatured: boolean;

  @ManyToOne(() => UserEntity, (user) => user.providerBanners)
  user: UserEntity[];
}
