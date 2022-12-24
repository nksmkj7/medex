import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { ValidationErrorInterface } from 'src/common/interfaces/validation-error.interface';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import path = require('path');
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { startCase } from 'lodash';
@Catch(HttpException)
export class I18nExceptionFilterPipe implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    return response
      .status(exception.getStatus())
      .json(
        await this.getMessage(
          exception,
          ctx.getRequest().i18nLang || ctx.getRequest().headers['x-custom-lang']
        )
      );
  }

  async getMessage(exception: HttpException, lang: string) {
    const exceptionResponse = exception.getResponse() as any;
    if (!exceptionResponse.message && typeof exceptionResponse === 'string') {
      return await this.i18n.translate(`exception.${exceptionResponse}`, {
        lang,
        args: {}
      });
    }
    if (exceptionResponse.statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
      if (
        exceptionResponse.hasOwnProperty('message') &&
        exceptionResponse.message instanceof Array
      ) {
        exceptionResponse.code = StatusCodesList.ValidationError;
        exceptionResponse.message = await this.translateArray(
          exceptionResponse.message,
          lang
        );
      }
      return exceptionResponse;
    }
    let errorMessage = 'internalError';
    if (exceptionResponse.message instanceof Array) {
      errorMessage = exceptionResponse.message[0];
    } else if (typeof exceptionResponse.message === 'string') {
      errorMessage = exceptionResponse.message;
    } else if (
      !exceptionResponse.message &&
      typeof exceptionResponse === 'string'
    ) {
      errorMessage = exceptionResponse;
    }

    const { title, argument } = this.checkIfConstraintAvailable(errorMessage);
    exceptionResponse.message = await this.i18n.translate(
      `exception.${title}`,
      {
        lang,
        args: {
          ...argument
        }
      }
    );
    return exceptionResponse;
  }

  checkIfConstraintAvailable(message: string): {
    title: string;
    argument: Record<string, any>;
  } {
    try {
      const splitObject = message.split('-');
      if (!splitObject[1]) {
        return {
          title: splitObject[0],
          argument: {}
        };
      }
      return {
        title: splitObject[0],
        argument: JSON.parse(splitObject[1])
      };
    } catch (e) {
      return {
        title: message,
        argument: {}
      };
    }
  }

  async translateArray(errors: any[], lang: string) {
    const validationData: Array<ValidationErrorInterface> = [];
    for (let i = 0; i < errors.length; i++) {
      const constraintsValidator = [
        'validate',
        'isEqualTo',
        'isIn',
        'matches',
        'maxLength',
        'minLength',
        'isEnum',
        'min',
        'max',
        'isPhoneNumber',
        'isValidForeign',
        'isNumberString',
        'unique'
      ];
      const item = errors[i];
      let message = [];

      let getErrorMessage = async (constraints) => {
        return await Promise.allSettled(
          Object.keys(constraints).map(async (key: string) => {
            let validationKey: string = key,
              validationArgument: Record<string, any> = {};
            if (constraintsValidator.includes(key)) {
              const { title, argument } = this.checkIfConstraintAvailable(
                constraints[key]
              );
              validationKey = title;
              validationArgument = argument;
            }
            
            const message = await this.i18n.translate(
              `validation.${validationKey}`,
              {
                lang,
                args: {
                  ...validationArgument,
                  property: item.property
                }
              }
            );

            if (/validation.+/g.test(message)) {
              if (constraintsValidator.includes(key)) {
                return message.split('.')[1] ?? '';
              }
              return constraints[key];
            }
            return message;
          })
        );
      };
      if (item.constraints) {
        if (Array.isArray(item.constraints)) {
          for await (const constraint of item.constraints) {
            message = await getErrorMessage(constraint);
            validationData.push({
              name: item.property,
              errors: message.map((err) => err.value)
            });
          }
        } else {
          message = await getErrorMessage(item.constraints);
          validationData.push({
            name: item.property,
            errors: message.map((err) => err.value)
          });
        }
      } else if (item.children) {
        const getChildrenConstraints = async (childError, propertyName) => {
          if (childError?.children && childError.children.length > 0) {
            for await (const child of childError.children) {
              await getChildrenConstraints(
                child,
                `${propertyName}.${childError.property}`
              );
            }
          }

          if (childError?.constraints) {
            message = await getErrorMessage(childError.constraints);
            validationData.push({
              name: `${propertyName}.${childError.property}`,
              errors: message.map((err) => err.value)
            });
          }
        };
        for await (const child of item.children) {
          await getChildrenConstraints(child, item.property);
        }
      }
    }
    // console.log(validationData, 'validation data is --->');
    // for await (const item of validationData) {
    //   // validationData.forEach((item) => {
    //   if (item?.errors && item.errors.length) {
    //     const i18nFilePath = path.join(__dirname, '../../../src/i18n/');
    //     readdirSync(i18nFilePath).map((file) => {
    //       const jsonFilePath = path.join(i18nFilePath, file, 'app.json');

    //       const jsonData = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));
    //       // item.name = startCase(item.name);
    //       jsonData[item.name] = startCase(item.name);
    //       writeFileSync(jsonFilePath, JSON.stringify(jsonData), 'utf-8');
    //       // item.name = startCase(item.name);
    //     });
    //   }
    //   // });
    // }
    return validationData;
  }
}
