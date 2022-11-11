import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Unique(['slug'])
@Entity({
  name: 'static_pages'
})
export class StaticPageEntity extends CustomUuidBaseEntity {
  @Column('varchar')
  title: string;

  @Column('varchar')
  slug: string;

  @Column('text', {
    nullable: true
  })
  content: string;
}
