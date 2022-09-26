import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CustomerRepository } from 'src/customer/customer.repository';

@Injectable()
export class ParseCustomerId implements PipeTransform {
  constructor(private customerRepository: CustomerRepository) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const customer = await this.customerRepository.findBy(
      'id',
      value.customerId
    );
    return customer;
  }
}
