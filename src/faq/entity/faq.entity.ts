import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({
  name: 'faqs'
})
@Unique(['position'])
export class FaqEntity extends CustomBaseEntity {
  @Column('text', {
    nullable: false
  })
  question: string;

  @Column('text', {
    nullable: false
  })
  answer: string;

  @Column('integer', {
    unique: true,
    nullable: false
  })
  position: number;

  @Column('boolean', {
    default: false
  })
  status: boolean;
}
