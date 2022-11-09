import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';

export class PaymentGatewayException extends HttpException {
  constructor(message?: string, statusCode?: number, code?: number) {
    super(
      {
        message: message || ExceptionTitleList.PaymentGatewayException,
        code: code || StatusCodesList.BadRequest,
        statusCode: statusCode || HttpStatus.BAD_REQUEST,
        error: true
      },
      statusCode || HttpStatus.BAD_REQUEST
    );
  }
}
