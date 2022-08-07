import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

export function IsTime(
  property: '24h' | '12h' = '24h',
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTime',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const _24HrTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
          const _12HrTimeRegex = /^(0[0-9]|1[0-2]):[0-5][0-9]$/;
          const [relatedPropertyName] = args.constraints;
          switch (relatedPropertyName) {
            case '24h':
              return _24HrTimeRegex.test(value);
            case '12h':
              return _12HrTimeRegex.test(value);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.value} is not a valid time. HH:MM format is required and should be in ${args.constraints}.`;
        }
      }
    });
  };
}
