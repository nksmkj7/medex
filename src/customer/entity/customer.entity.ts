import { Exclude } from 'class-transformer';
import { CustomUuidBaseEntity } from 'src/common/entity/custom-uuid-base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import * as bcrypt from 'bcrypt';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

@Entity({
  name: 'customers'
})
export class CustomerEntity extends CustomUuidBaseEntity {
  [x: string]: any;
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
  tokenValidityDate: Date;

  @Column()
  status: UserStatusEnum;

  @Column()
  @Exclude({
    toPlainOnly: true
  })
  salt: string;
  user: any;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
