import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnprocessableEntityException
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { omit } from 'lodash';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    if (!value) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const translatedError = await this.transformError(errors);
      throw new UnprocessableEntityException(translatedError);
    }
    if (value?._requestContext) return omit(value, ['_requestContext']);
    return value;
  }

  async transformError(errors: ValidationError[]) {
    const data = [];
    for (const error of errors) {
      data.push({
        property: error.property,
        constraints: error.constraints
      });
    }
    return data;
  }

  private toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
