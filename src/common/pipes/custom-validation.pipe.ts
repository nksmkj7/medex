import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
  ValidationPipe,
  ValidationPipeOptions
} from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { omit } from 'lodash';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions) {
    super(options)
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (this.expectedType) {
        metadata = Object.assign(Object.assign({}, metadata), { metatype: this.expectedType });
    }
    const metatype = metadata.metatype;
    if (!metatype || !this.toValidate(metadata)) {
        return this.isTransformEnabled
            ? this.transformPrimitive(value, metadata)
            : value;
    }
    const originalValue = value;
    value = this.toEmptyIfNil(value);
    const isNil = value !== originalValue;
    const isPrimitive = this.isPrimitive(value);
    this.stripProtoKeys(value);
    let entity:object = plainToClass(metatype, value, this.transformOptions);
     const originalEntity = entity;
        const isCtorNotEqual = entity.constructor !== metatype;
        if (isCtorNotEqual && !isPrimitive) {
            entity.constructor = metatype;
        }
        else if (isCtorNotEqual) {
            // when "entity" is a primitive value, we have to temporarily
            // replace the entity to perform the validation against the original
            // metatype defined inside the handler
            entity = { constructor: metatype };
        }
    const errors = await this.validate(entity, this.validatorOptions);
    if (value?._requestContext) {
      value = omit(value, ['_requestContext'])
      entity= omit(entity, ['_requestContext'])
    };
      if (errors.length > 0) {
        const translatedError = await this.transformError(errors);
        throw new UnprocessableEntityException(translatedError);
      }
      if (isPrimitive) {
          // if the value is a primitive value and the validation process has been successfully completed
          // we have to revert the original value passed through the pipe
          entity = originalEntity;
      }
      if (this.isTransformEnabled) {
          return entity;
      }
      if (isNil) {
          // if the value was originally undefined or null, revert it back
          return originalValue;
      }

  
  
      return Object.keys(this.validatorOptions).length > 0
          ? classToPlain(entity, this.transformOptions)
          : value;

  
  }

  async transformError(errors: ValidationError[]) {
    const data = [];
    for (const error of errors) {
      // data.push({
      //   property: error.property,
      //   // constraints: error.constraints
      //   constraints: error.constraints || this.getError(error)
      // });
      data.push({ ...this.getError(error, {}) });
    }
    return data;
  }

  getError(
    error: ValidationError,
    errorAccumulator: {} | { property: string; constraints: [] | {} } = {}
  ) {
    const hasChildren = (children: ValidationError[] | undefined) => {
      return children && children.length > 0;
    };
    if (
      !hasChildren(error?.children) &&
      Object.keys(errorAccumulator).length <= 0
    ) {
      return {
        property: error.property,
        constraints: error.constraints
      };
    }
    if (!hasChildren(error?.children)) {
      errorAccumulator['constraints'] = error.constraints;
    } else {
      if (Object.keys(errorAccumulator).length <= 0) {
        errorAccumulator = {
          property: error.property
        };
      }

      errorAccumulator['children'] = errorAccumulator?.['children'] ?? [];
      Object.values(error.children).forEach((childError: ValidationError) => {
        let err = { property: childError.property };
        if (!hasChildren(childError?.['children'])) {
          err['constraints'] = childError.constraints;
        } else {
          this.getError(childError, err);
        }
        errorAccumulator['children'].push(err);
      });
    }

    // }
    return errorAccumulator;
  }

  toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
