import { BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint
} from 'class-validator';
import { Connection } from 'typeorm';
// import { isInt } from 'class-validator';

@ValidatorConstraint({ async: true })
export class RunValidation implements ValidatorConstraintInterface {
  constructor(@InjectConnection() protected readonly connection: Connection) {}

  async validate<E>(value: string | number, args: ValidationArguments) {
    const [validationFn, checkValueAgainst] = args.constraints;
    if (!args.object.hasOwnProperty(checkValueAgainst)) {
      return false;
    }
    return validationFn(args.object[checkValueAgainst], value);
  }

  defaultMessage(args: ValidationArguments) {
    return `Invalid ${args.property}`;
  }
}
