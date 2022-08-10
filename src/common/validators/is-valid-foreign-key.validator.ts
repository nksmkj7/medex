import { BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint
} from 'class-validator';
import { Connection } from 'typeorm';

@ValidatorConstraint({ name: 'isValidForeign', async: true })
export class IsValidForeignKey implements ValidatorConstraintInterface {
  constructor(@InjectConnection() protected readonly connection: Connection) {}

  async validate(value: string, args: ValidationArguments) {
    const [EntityClass, keyName = 'id'] = args.constraints;
    if (!EntityClass) {
      throw new BadRequestException(
        'Entity class is missing for valid foreign key validation'
      );
    }
    return (
      (await this.connection
        .createQueryBuilder()
        .from(EntityClass, 'foreignTable')
        .where(`foreignTable.${keyName} = :value`, { value })
        .getCount()) >= 1
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `Invalid ${args.property}`;
  }
}
