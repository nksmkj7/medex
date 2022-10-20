import { UserEntity } from 'src/auth/entity/user.entity';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, ManyToOne } from 'typeorm';

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

  @Column('boolean', {
    default: true
  })
  status: boolean;

  @ManyToOne(() => UserEntity, (user) => user.banners)
  //   @JoinColumn({ name: 'userId' })
  provider: UserEntity;
}
