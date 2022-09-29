import { EntityRepository, ObjectLiteral } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { CustomerEntity } from './entity/customer.entity';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { CustomerSerializer } from './serializer/customer.serializer';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@EntityRepository(CustomerEntity)
export class CustomerRepository extends BaseRepository<
  CustomerEntity,
  CustomerSerializer
> {
  async store(customerSignupDto: ObjectLiteral): Promise<CustomerSerializer> {
    const customer = this.create(customerSignupDto);
    await customer.save();
    return this.transform(customer);
  }

  /**
   * transform single role
   * @param model
   * @param transformOption
   */
  transform(model: CustomerEntity, transformOption = {}): CustomerSerializer {
    return plainToClass(
      CustomerSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }

  /**
   * transform array of roles
   * @param models
   * @param transformOption
   */
  transformMany(
    models: CustomerEntity[],
    transformOption = {}
  ): CustomerSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }

  async getUserForResetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<CustomerEntity> {
    const { token } = resetPasswordDto;
    const query = this.createQueryBuilder('customers');
    query.where('customers.token = :token', { token });
    query.andWhere('customers.tokenValidityDate > :date', {
      date: new Date()
    });
    return query.getOne();
  }

  async updateItem(
    customer: CustomerEntity,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<CustomerSerializer> {
    const updatedBanner = this.merge(customer, updateCustomerDto);
    await updatedBanner.save();
    return this.transform(updatedBanner);
  }
}
