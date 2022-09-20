import { EntityRepository, ObjectLiteral } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { BaseRepository } from 'src/common/repository/base.repository';

import { CustomerEntity } from './entity/customer.entity';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { CustomerSerializer } from './serializer/customer.serializer';

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
}
