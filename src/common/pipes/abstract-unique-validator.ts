import {
  ValidationArguments,
  ValidatorConstraintInterface
} from 'class-validator';
import {
  Connection,
  EntitySchema,
  FindConditions,
  Not,
  ObjectLiteral,
  ObjectType
} from 'typeorm';

/**
 * unique validation arguments
 */
export interface UniqueValidationArguments<E> extends ValidationArguments {
  object: {
    _requestContext?: [];
    [index: string]: any;
  };
  constraints: [
    ObjectType<E> | EntitySchema<E> | string,
    ((validationArguments: ValidationArguments) => FindConditions<E>) | keyof E,
    string,
    ObjectLiteral
  ];
}

/**
 * abstract class to validate unique
 */
export abstract class AbstractUniqueValidator
  implements ValidatorConstraintInterface
{
  protected constructor(protected readonly connection: Connection) {}

  /**
   * validate method to validate provided condition
   * @param value
   * @param args
   */
  public async validate<E>(value: string, args: UniqueValidationArguments<E>) {
    const _requestContext = args.object?._requestContext;

    const [EntityClass, findCondition = args.property] = args.constraints;
    const compareWith = args.constraints[2] || 'id';
    const { relations = [], whereCondition: extraWhereCondition = {} } =
      args.constraints[3] || {};
    function getSearchCondition(findCondition: { [index: string]: string }) {
      if (_requestContext && _requestContext?.['params']?.[compareWith]) {
        return {
          ...findCondition,
          id: Not(_requestContext['params'][compareWith]),
          ...extraWhereCondition
        };
      }
      return findCondition;
    }
    function getCountCondition(findCondition) {
      const condition = {
        where:
          typeof findCondition === 'function'
            ? findCondition(args)
            : getSearchCondition({
                [findCondition || args.property]: value
              })
      };
      if (relations.length > 0) {
        condition['relations'] = relations;
      }
      return condition;
    }
    return (
      (await this.connection
        .getRepository(EntityClass)
        .count(getCountCondition(findCondition))) <= 0
    );
  }

  /**
   * default message
   * @param args
   */
  public defaultMessage(args: ValidationArguments) {
    return `${args.property} '${args.value}' already exists`;
  }
}
