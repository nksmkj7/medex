import { Exclude } from 'class-transformer';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { Column, Entity, Index } from 'typeorm';
import { UserStatusEnum } from 'src/auth/user-status.enum';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

@Entity({
  name: 'customers'
})
export class CustomerEntity extends CustomUuidBaseEntity {
  @Index({
    unique: true
  })
  @Column()
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true
  })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dob: Date;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @Column()
  postCode: string;

  @Column()
  area: string;

  @Column()
  city: string;

  @Column()
  profilePicture: string;

  @Column()
  gender: GenderEnum;

  @Column()
  token: string;

  @Column()
  tokenValidityDate: string;

  @Column()
  status: UserStatusEnum;
}
