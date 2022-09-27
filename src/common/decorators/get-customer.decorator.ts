import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParseCustomerId } from '../pipes/parse-customer-id';

export const getCustomerEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

export const GetCustomer = (additionalOptions?: any) => {
  return getCustomerEntity(additionalOptions, ParseCustomerId);
};
